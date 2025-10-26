import re
import os, uuid, mimetypes, threading, logging
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from faster_whisper import WhisperModel
from pymongo import MongoClient
from gtts import gTTS
from google.generativeai import configure, GenerativeModel
import torch
import torch.nn as nn
import torchaudio
from transformers import Wav2Vec2Processor, Wav2Vec2Model
import librosa

#app.py->gcp vm 플라스크 실행할 작업 폴더에 업로드->플라스크 실행->index.html은 웹주소 입력이 아닌 로컬에서 실행.
# ----------------------------
# 환경 변수 및 경로 설정
# ----------------------------
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB  = os.environ.get("MONGODB_DB", "Conversation")
UPLOAD_DIR  = os.environ.get("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "uploads"))
OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), "generated_audio")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Flask 설정
app = Flask(__name__, template_folder="templates")
CORS(app)

# 로깅
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Google Gemini API 키 설정
GOOGLE_API_KEY = "AIzaSyDlSbO5hDbbBHlh0Oq6cnQ04o8LE_5f7pY"
configure(api_key=GOOGLE_API_KEY)
gemini_model = GenerativeModel("gemini-2.5-flash")

# Whisper 모델 (한국어 전사용)
model = WhisperModel("small", device="cpu", compute_type="int8")

# MongoDB 연결
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
recs = db.recordings

# ----------------------------
# 감정 분석 모델 로드 (예시)
# ----------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 1️⃣ Wav2Vec2 모델 로드
wav2vec_processor = Wav2Vec2Processor.from_pretrained("eunyounglee/wav2vec_korean")
wav2vec_model = Wav2Vec2Model.from_pretrained("eunyounglee/wav2vec_korean").to(device)

# 2️⃣ 감정 분류기 정의
class EmotionClassifier(nn.Module):
    def __init__(self, input_dim=1024, num_classes=7):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        return self.fc(x)

# 3️⃣ 감정 모델 로드
emotion_model_path = "./model/voice_emotion_model.pth"  # 학습된 모델 경로
num_classes = 7  # 감정 라벨 개수

try:
    emotion_model = EmotionClassifier(input_dim=1024, num_classes=num_classes).to(device)
    emotion_model.load_state_dict(torch.load(emotion_model_path, map_location=device))
    emotion_model.eval()
    logger.info("✅ 감정 분석 모델 로드 완료.")
except Exception as e:
    logger.error(f"❌ 감정 분석 모델 로드 실패: {e}")
    emotion_model = None

# ----------------------------
# 헬퍼 함수
# ----------------------------
def clean_wikilinks(text):
    text = re.sub(r'\[\[([^|\]]+)\|([^\]]+)\]\]', r'\2', text)
    text = re.sub(r'\[\[([^\]]+)\]\]', r'\1', text)
    text = re.sub(r'\[\[([^\[#\|\]]+)(#[^\]]+)?\]\]', r'\1', text)
    return text


#https://namu.wiki/w/%EC%96%B8%EC%96%B4%20%EC%98%88%EC%A0%88 참고.
ref_text="""언어 예절: 우리가 사회생활에서 꼭 필요한 예절 중 하나이다.
대화하는데 있어서 상대방을 존중하고 배려하는 마음을 언어로 표현하는 방식이 사회적 관습화된 것을 말한다. 서로 갈등이 생기지 않게 올바른 대화 습관을 가지는 것이 중요하다.
=== 공손성의 원리 ===
상대방을 존중하고 배려하는 마음을 갖고 예절 바르게 대화하는 것이 중요하다. 대화가 올바르지 않으면 상대방과 서로 갈등이 생길 수도 있고, 관계가 흐트러질 수 있기 때문이다. 서로의 관계와 대화 상황을 고려하지 않으면 대화가 올바르더라도 오해가 생기는 일이 있을 수 있다. 그러니 서로 대화할 때 서로의 관계와 상황을 살펴가며 상대방을 존중하고 공손하게 말해야 하는 것이 옳다.
== 대화의 원리 ==
|||| 종류 ||||
|| 요령의 격률 || 상대방에게 부담이 되는 표현은 최소화하고, 상대방에게 이익이 되는 표현을 최대화하는 방법이다. ||
|| 관용의 격률 || 말하는 사람의 입장에서, 자신에게 이익이 되는 표현은 최소화하고, 자신에게 부담이 되는 표현을 최대화하는 방법이다.(자신의 탓으로 돌림)[* 겸양의 격률과 헷갈리기 쉬운데, 관용은 내 잘못/실수, 겸양은 내 능력 자체의 부족으로 생각하면 쉽다.] ||
|| 찬동의 격률 || 상대방을 비하하는 표현을 최소화하고, 상대방을 칭찬하는 표현은 최대화하는 방법이다. ||
|| 겸양의 격률 || 말하는 사람의 입장에서, 자신을 칭찬하는 표현은 최소화하고, 자신을 낮추는 표현은 최대화하는 방법이다. ||
|| 동의의 격률 || 상대방의 의견과 불일치하는 표현은 최소화하고, 상대방의 의견과 일치하는 표현은 최대화하는 방법이다. ||

=== 순서 교대의 원리 ===
대화 참여자가 적절하게 역할을 교대해 가며 서로 말을 주고받아, 원활하게 정보가 순환되도록 한다. 

이 대화를 할 때도 주의사항이 있다.

 *말을 너무 길게 하지 않는다.
 *혼자서 대화를 독점하지 않는다.
 *상황을 살펴가며 대화에 참여한다.

=== 협력의 원리 ===
대화의 목적을 달성할 수 있도록 대화 참여자가 서로 협력하는 원리를 말한다.

|||| 종류 ||||
|| 양의 격률 || 필요한 만큼의 정보 제공 ||
|| 질의 격률 || 진실이라 생각할 만한 정보 제공 ||
|| 태도의 격률 || 모호한 표현이 아닌 명료한 표현 사용 ||
|| 관련성의 격률 || 맥락에 맞는 표현 사용 ||

== 상황에 따른 언어 예절 ==
상대방의 감정을 상하지 않게 하는 방법 중 하나이다. 기본적으로 상황에 맞게 올바르게 대화 하는 것이 바람직하다. 그렇지 않은 경우, 웬만해선 상황이 악화되기 마련이다. 예를 들어 어떤 사람과 부딪혔는데 그 사람에게 사과를 못 할 망정, 되려 그 사람에게 "눈 좀 똑바로 다니세요! 너 몇 살이냐? 맞고 싶냐? ㅈㄴ 짜증나!"라고 말하면 그 사람의 기분과 심정은 어떨까? 당연히 그 사람은 몹시 억울하고 상당히 마음의 상처를 크게 받은 심정--이기보다는 같이 쌍욕을 해주고 싶은 심정--일 것이다. 그러니 상황에 따라 상대방을 존중하면서 공손하게 말하도록 하자.
|||| 종류 ||||
|| 사과 || 자기의 잘못을 인정하고 용서를 비는 말이다. 자신의 잘못을 구체적으로 밝히고, 상대방의 입장을 살피면서 말한다. ||
|| 부탁 || 어떤 일을 해 달라고 청하는 말이다. 상대방의 입장을 배려하고, 정중하고 공손하게 말한다. ||
|| 건의 || 상대방에게 의견이나 희망을 내놓는 말이다. 상대방을 존중하는 태도로, 차분하면서도 공손하게 말한다. ||
|| 거절 || 상대편의 요구, 제안, 선물, 부탁 따위를 받아들이지 않고 물리치는 말이다. 상대방이 부담스럽지 않게 구체적인 이유를 제시하며, 완곡하고 정중하게 말한다. ||
|| 위로 || 따뜻한 말이나 행동으로 괴로움을 덜어 주거나 슬픔을 달래 주는 말이다. 신중한 태도로, 희망적인 내용이 들어가게 말하는 것이 좋다. ||

예시
>친구가 일정 약속 시간에 오지 않았을 때(사과) 
>철수: 야 너 왜 이렇게 늦게 왔어. 내가 일정 시간에 빨리 오라고 했잖아. 
>희찬: 아… 미안해. 내가 길을 건너려고 하는데, 어떤 할머니가 무거운 짐을 들고 계시길래 할머니를 도와드리다가 늦었어. 다시는 늦게 오지 않을게…
>철수: 아, 그런 이유라면 괜찮아. 용서해줄게.

>민수가 달리기 대회를 하는 도중에 돌에 넘어졌을 때(위로)
>민수: 아얏! 돌에 발이 걸려서 넘어졌어!
>진영: 괜찮아? 어디 안 다쳤어? 피가 철철 흐르는데... 내가 보건실까지 데려다 줄까? 네 상처가 빨리 나았으면 좋겠어.
>민수: 괜찮아. 걱정해줘서 고마워.

== 바람직한 의사소통 문화 ==
=== 대한민국의 담화 관습 ===
|||| 담화 관습 ||||
|| 겸양 어법 || 상대방을 높이고 자신을 낮추는 말하기 방식이다. 예의를 중시하는 전통문화의 영향을 받았다. ||
|| 완곡 어법 || 상대의 감정을 상하게 할 수 있는 말을 돌려 말한다. 직접적인 표현이 어려운 경우는 부드러운 말로 완곡하게 표현한다. ||
|| 관용 표현 || 두 개 이상의 낱말이 합쳐져 새로운 말로 굳어져 사용되는 표현이다. 예로 관용어, 속담이 이에 해당된다. ||

 언어 공동체의 담화 관습은 고정불변한 것이 아니라, 상황과 사회의 변화에 따라 달라질 수 있다. 담화 관습을 잘 이해하고 언어 예절을 지킬 때 바람직한 의사소통이 이루어 질 수 있다.
"""
REFERENCE_CONTEXT = clean_wikilinks(ref_text)

def build_prompt(context: str, transcript: str, emotion: str) -> str:
    """
    대화 내용을 요약하고 감정 정보를 반영하여 한국어로 답변 요청하는 프롬프트.
    """
    return f"""
당신은 예의 바르고 공손한 말하기를 돕는 한국어 대화 도우미입니다.

다음은 사용자의 말(감정 분석 결과 포함)입니다. 
이를 바탕으로 상대방의 감정 상태를 고려하여 공손하고 배려 있는 응답을 **3문장 이내로** 작성하세요. 추가로 감정 분석할 때는 사용자 발화 내용도 고려해주세요.

[상황 설명 / 참고 내용]
{context.strip()}

[감정 분석 결과]
{emotion}

[사용자 발화 내용]
{transcript.strip()}

요약 및 응답 (한국어로 작성):
"""

def safe_name(mtype: str) -> str:
    ext = mimetypes.guess_extension(mtype or "") or ".webm"
    return f"{uuid.uuid4().hex}{ext}"

def cleanup_file(path):
    try:
        os.remove(path)
    except Exception as e:
        logger.warning(f"파일 삭제 실패: {path}, 이유: {e}")

def extract_embedding(file_path):
    waveform, sr = librosa.load(file_path, sr=16000)
    inputs = wav2vec_processor(waveform, sampling_rate=16000, return_tensors="pt")
    with torch.no_grad():
        outputs = wav2vec_model(**inputs.to(device))
    embedding = outputs.last_hidden_state.mean(dim=1).squeeze()  # [1024]
    return embedding.unsqueeze(0)

def predict_emotion(audio_path: str) -> str:
    """Wav2Vec2 임베딩 기반 감정 예측"""
    if emotion_model is None:
        return "unknown"
    try:
        embedding = extract_embedding(audio_path).to(device)
        with torch.no_grad():
            logits = emotion_model(embedding)
            pred = torch.argmax(logits, dim=1).item()

        # 감정 라벨 (학습 라벨 순서에 맞게 수정)
        label_map = ["happiness", "angry", "neutral", "sadness", "disgust", "surprise", "fear"]
        return label_map[pred] if pred < len(label_map) else "unknown"
    except Exception as e:
        logger.error(f"감정 분석 실패: {e}")
        return "error"

# ----------------------------
# Flask 라우트
# ----------------------------
@app.route("/uploads/<path:fn>")
def serve_upload(fn):
    return send_from_directory(UPLOAD_DIR, fn, as_attachment=False)

@app.route("/audio/<path:fn>")
def serve_audio(fn):
    return send_from_directory(OUTPUT_FOLDER, fn, as_attachment=True)

@app.route("/upload_audio", methods=["POST"])
def upload_audio():
    if "audio" not in request.files:
        return jsonify({"success": False, "message": "audio 파일 없음"}), 400

    f = request.files["audio"]
    filename = safe_name(f.mimetype)
    upload_path = os.path.join(UPLOAD_DIR, filename)
    f.save(upload_path)
    logger.info(f"오디오 업로드 완료: {upload_path}")

    # ------------------------------
    # 1️⃣ WebM/Opus → WAV 변환
    # ------------------------------
    try:
        import tempfile
        from pydub import AudioSegment

        def convert_webm_to_wav(webm_path):
            wav_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            audio = AudioSegment.from_file(webm_path, format="webm")
            audio.export(wav_file.name, format="wav")
            return wav_file.name

        wav_path = convert_webm_to_wav(upload_path)
    except Exception as e:
        logger.error(f"오디오 변환 실패: {e}")
        return jsonify({"success": False, "message": "오디오 변환 실패"}), 500

    # ------------------------------
    # 2️⃣ Whisper 전사 (한국어)
    # ------------------------------
    try:
        segs_ko, _ = model.transcribe(wav_path, task="transcribe", language="ko", vad_filter=True, beam_size=5)
        text_ko = "".join(s.text for s in segs_ko).strip()
    except Exception as e:
        logger.error(f"Whisper 전사 실패: {e}")
        text_ko = ""

    # ------------------------------
    # 3️⃣ 감정 분석 (wav2vec 모델)
    # ------------------------------
    detected_emotion = predict_emotion(wav_path)
    logger.info(f"감정 분석 결과: {detected_emotion}")

    # ------------------------------
    # 4️⃣ Gemini 요약 (감정 포함)
    # ------------------------------
    prompt = build_prompt(REFERENCE_CONTEXT, text_ko, detected_emotion)
    response = gemini_model.generate_content(prompt)
    ai_response = response.text.strip().replace('**', '')

    # ------------------------------
    # 5️⃣ TTS 생성
    # ------------------------------
    tts = gTTS(text=ai_response, lang='ko', slow=False)
    audio_filename = f"response_{uuid.uuid4().hex}.mp3"
    audio_path = os.path.join(OUTPUT_FOLDER, audio_filename)
    tts.save(audio_path)
    logger.info(f"TTS 생성 완료: {audio_path}")

    # ------------------------------
    # 6️⃣ MongoDB 저장
    # ------------------------------
    now = datetime.now().isoformat()
    recs.insert_one({
        "asr_text_ko": text_ko,
        "emotion": detected_emotion,
        "ai_response": ai_response,
        "audio_url": f'/audio/{audio_filename}',
        'timestamp': now,
        "user": "Chatbot"
    })

    # ------------------------------
    # 7️⃣ 업로드 및 변환 파일 삭제
    # ------------------------------
    threading.Thread(target=cleanup_file, args=(upload_path,), daemon=True).start()
    threading.Thread(target=cleanup_file, args=(wav_path,), daemon=True).start()

    # ------------------------------
    # 8️⃣ 결과 반환
    # ------------------------------
    return jsonify({
        "success": True,
        "message": "전사 및 감정 분석 완료",
        "data": {
            "file_url": f"/uploads/{filename}",
            "asr_text_ko": text_ko,
            "emotion": detected_emotion,
            "ai_response": ai_response,
            "audio_url": f'/audio/{audio_filename}',
            'timestamp': now,
            "user": "Chatbot"
        }
    })

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5022, debug=True)
