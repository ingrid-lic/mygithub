//import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function Header(props){
  //console.log("props",props,props.title);
  return <header>
        <h1><a href='/' onClick={function(event) {
          event.preventDefault();
          props.onChangeMode();
        }}>{props.title}</a></h1>
      </header>
}

function Nav(props){
  /*const lis=[
    <li><a href='/read/1'>html</a></li>,
    <li><a href='/read/2'>css</a></li>,
    <li><a href='/read/3'>Js</a></li>
  ]*/
  const lis=[]
  for(let i=0;i<props.topics.length;i++){
    let t=props.topics[i];
    lis.push(<li key={t.id}><a id={t.id} href={'/read/'+t.id} onClick={(event)=>{
      event.preventDefault();
      props.onChangeMode(Number(event.target.id));
    }}>{t.title}</a></li>)
  }
  return <nav>
        <ol>
          {lis}
        </ol>
      </nav>
}

function Article(props){
  return <article>
        <h2>{props.title}</h2>
          {props.body}
      </article>
}

function App() { 
  //const _mode=useState("WELCOME");
  //const mode=_mode[0];
  //const setMode=mode[1];
  //console.log('_mode',mode);
  const [mode,setMode]=useState("WELCOME");
  const [id,setId]=useState(null);
  const topics=[
      {id:1, title:"html", body:"html is ..."},
      {id:2, title:"css", body:"css is ..."},
      {id:3, title:"Js", body:"Js is ..."}
    ]
  let content=null;
  if(mode==="WELCOME"){
    content=<Article title="WELCOME" body="HELLO, WEB"></Article>
  }else if(mode==="READ"){
    let title, body=null;
    for(let i=0;i<topics.lengthl;i++){
      if(topics[i]===id){
        title=topics[i].title;
        body=topics[i].body;
      }
    }
    content=<Article title={title} body={body}></Article>
  }
  return (
    /*<div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>*/
    <div>
      <Header></Header>
      <Header title="REACT" onChangeMode={function(){
        //alert('Header');
        setMode("WELCOME");
      }}></Header>
      <Nav topics={topics} onChangeMode={(id)=>{
        //alert(id);
        setMode("READ");
        setId(id);
      }}></Nav>
      {content}
      <Article title="WELCOME" body="HELLO, WEB"></Article>
    </div>
  );
}

export default App;
