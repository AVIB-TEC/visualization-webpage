import { Injectable } from '@angular/core';
import { AngularNeo4jService } from 'angular-neo4j';

@Injectable({
  providedIn: 'root'
})
export class Neo4jService {
	
  url:string='bolt://avib-graph-neo4j-core-0.avib-graph-neo4j.default.svc.cluster.local:7687';
  username:string= 'neo4j';
  password:string= 'neo4j';
  encrypted:boolean=true;

  constructor(private neo4j: AngularNeo4jService) {}

  connect(){
    return this.neo4j.connect(this.url,this.username,this.password,this.encrypted);
  }

  getChain(methodName){
    console.log(methodName)
    return this.neo4j.run('MATCH (m:Metodo {name:'+"'"+methodName+"'"+'})-[r:CALLS *]->(b) RETURN m,r,b')
  }

  close(){
    this.neo4j.disconnect();
  }
}
