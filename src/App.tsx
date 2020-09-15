import React, { useState } from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Link, Redirect, useParams,useHistory } from 'react-router-dom'

import { ApolloClient, InMemoryCache,useQuery,gql, ApolloProvider } from '@apollo/client';
import './App.css'

const DEFAULT_PAGESIZE = 100

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache()
});
export default function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Switch>
          <Route path="/messages/:topicsDelimitedByComma?">
            <MessageScreen />
          </Route>
          <Route path="/">
            <Redirect to="/messages" />
          </Route>
        </Switch>
      </Router>
    </ApolloProvider>
  )
}
const MESSAGES = gql`
  query Messages($topics:[Int!]!,$offset:Int!,$limit:Int!) {
    messages(topics:$topics,limit:$limit,offset:$offset){ id, player, flags, text, topics {confidence, relevance, topic}}
  }
`;
interface Message {
  id:number,
  player:string
  flags:number,
  text:string,
  topics:Topic[]
}
interface Topic {
  id:number,
  confidence:number,
  relevance:number,
  topic:number
}
function MessageScreen() {
  const { topicsDelimitedByComma='' } = useParams<{ topicsDelimitedByComma?: string }>()
  const selectedTopics = topicsDelimitedByComma.split(',').map(t=>t.trim()).filter(t=>t).map(t=>parseInt(t,10))
  const [pageNumber,setPageNumber] = useState(0)
  const limit = DEFAULT_PAGESIZE
  const{ loading, error, data } =  useQuery<{messages:Message[]}>(MESSAGES,{variables:{topics:selectedTopics,limit,offset:pageNumber*limit}})
  const classNames =['message-views-container',loading && 'loading',error && 'error', data && 'success'].filter(n=>n).join(' ') 
  return <div id="message-screen">
    <h1>Messages</h1>
    <div className={classNames}>
    {error ? error+'':data && data.messages.map(message=>{
    return <MessageView key={message.id} message={message} selectedTopics={selectedTopics}/>
  })}</div></div>
}
function MessageView({message:{player,text,topics},selectedTopics}:{message:Message,selectedTopics:number[]}){
  const history = useHistory()
  return <div className="message-view">
    
    <div className="message-player">Player: {player}</div>
    <div className="message-text">{text}</div>
    <div className="message-topics-container">{topics.map(({topic,id})=>{
      const selected = selectedTopics.includes(topic)
      const linkTopics = selectedTopics.filter(s=>s!=topic)
      if (!selected) linkTopics.push(topic) 
      return <div key={id} className={`message-topic ${selected ? 'selected':''}`} onClick={()=>{
        history.push(`/messages/${linkTopics.sort().join(',')}`)
      }}>
        {topic}
      </div>
    })}</div>
  </div>
}



