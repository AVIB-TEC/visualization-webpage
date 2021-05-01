import { 
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AngularNeo4jService } from 'angular-neo4j';
import * as d3 from 'd3';

import { AvibMethod } from '../../models/avib-method';
import { SocketioService } from '../../services/socketio.service';


@Component({
  selector: 'app-chain',
  templateUrl: './chain.component.html',
  styleUrls: ['./chain.component.scss']
})
export class ChainComponent implements OnInit {

  searchForm = this.formBuilder.group({
    qualifiedName : ['', Validators.required],
    metric1 : ['',Validators.required],
    metric2 : ['',Validators.required]
  })
  metric1="1";
  metric2="2";

	//D3
  margin = 50;
  width :number;
  height :number;
  svg:any;
  simulation:any;
  link:any;
  node:any;
  data:any;

  //socket
  hasTeam:boolean = false;
  currentSearch:any;
  alreadySubscribed=false;

  //Neo4j
  url:string='bolt://avib-graph-neo4j-core-0.avib-graph-neo4j.default.svc.cluster.local:7687';
  username:string= 'neo4j';
  password:string= 'admin';
  encrypted:boolean=false;

  constructor(
    private neo4jService : AngularNeo4jService,
    private formBuilder: FormBuilder,
    private socketioService: SocketioService) {
    console.log("Neo4j url: ", this.url);
  }

  ngOnInit(): void {
    this.searchForm.setValue({
      qualifiedName:'org.neo4j.driver.GraphDatabase.driver(URI,Config)',
      metric1:"1",
      metric2:"2"
    });

    //Get screen size
    this.socketioService.setupSocketConnection();
    this.createSocketSubscriptions();
    


    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.svg = d3.select("svg")
      .attr("width",this.width-10)
      .attr("height",this.height-100)
      .call(d3.zoom().on("zoom",(event:any) => {
              this.svg.attr("transform", event.transform)
            }))
      .append("g");

  	this.neo4jService.connect(this.url,this.username,this.password,this.encrypted)
  		.then(driver =>{
  			if(driver){
  				console.log("Connected succesfully");
  			}
  		});
    this.getData('org.neo4j.driver.GraphDatabase.driver(URI,Config)',1,2);
  }

  render(graph){
    //Clearview
    this.svg.selectAll("*").remove();
    //Initial Definition
    this.svg.append('defs')
      .append('marker')
      .attr('id','arrowhead')
      .attr('viewBox','-0 -5 10 10')
      .attr('refX',5)
      .attr('refY',0)
      .attr('orient','auto')
      .attr('markerWidth',8)
      .attr('markerHeight',8)
      .attr('xoverflow','visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke','none');
    
    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { 
          let temp :any = d;
          return temp.id; 
       })
        .distance(200)
        .strength(2)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2));

    const radiusScale = d3.scaleLinear()
      .domain(this.data.domain)
      .range([10,50]);

    const color = d3.scaleQuantize<string>()
        .domain(this.data.domain)
        .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

    this.link = this.svg.selectAll(".link")
      .data(graph.links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr('marker-end','url(#arrowhead)')

    const edgepaths = this.svg.selectAll(".edgepath")
      .data(graph.links)
      .enter()
      .append('path')
      .attr('class', 'edgepath')
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .style("pointer-events", "none");

    this.node = this.svg.selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", "nodes")
      .attr("r",(d)=>{ return radiusScale(d.firstMetric)})
      .call(d3.drag()
          .on("start", (event,d)=>{return this.dragstarted(event,d)})
          .on("drag", (event,d)=>{return this.dragged(event,d)})
          .on("end", (event,d)=>{return this.dragended(event,d)})
      )
    this.node.append('circle')
             .attr("r",(d)=>{ return radiusScale(d.firstMetric)}) 
             .attr("id", (d)=>{return d.id});
    //Sets the color at the begining
    d3.selectAll('circle') 
      .style("fill", (d)=> {
        let temp:any =d;
        let temp2  = color(temp.firstMetric);
        return temp2;
      });

    let  tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background-color", "black")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("padding", "10px")

    //Display tooltip
    let self = this;
    this.svg.selectAll('circle')
      .on('click', function (event,d) { // arrow function will produce this = undefined
         d3.selectAll('circle')
         //.style("fill", "lightgray");
         .style("fill", (d)=> {
           let temp:any;
           temp=d;
           let temp2 = color(temp.firstMetric)
           return temp2;
         });
         d3.select(this)
          .style("fill", "aliceblue");
         self.sendNode(d.name);
       })
      .on('mouseover', function (event,d) {
          d3.selectAll('circle')
            .style("stroke", "black");
          d3.select(this)
            .style("stroke", "green");
          return tooltip
            .text(d.name)
            .style("visibility", "visible")
      })
      .on("mousemove", function(event:MouseEvent){
          return tooltip
            .style("top", (event.clientY-10)+"px")
            .style("left",(event.clientX+10)+"px");
       })
      .on("mouseout", function(){
          return tooltip.style("visibility", "hidden");
      });

    this.node.append("title")
      .text(function(d) { return d.id; });

    this.simulation
      .nodes(graph.nodes)
      .on("tick", ()=>{return this.ticked()});

    this.simulation.force("link")
      .links(graph.links);  
  }

  async getData(method, metricType1,metricType2){
    await this.neo4jService.run('MATCH (m:Method {name:'+"'"+method+"'"+'})-[r:CALLS *]->(b) RETURN m,r,b')
    .then((result)=>{
      let mainMethod=null;
      let methodsList=[];
      let cont = 1;
      result.map(res=>{
        if(mainMethod==null){
          mainMethod = new AvibMethod(res[0].properties,0,[]);
          methodsList.push({"method":mainMethod, "depth":0});
        }
        let tempMethod = new AvibMethod(res[2].properties,cont,[])
        let temp = {"method":tempMethod, "depth":res[1].length}
        methodsList.push(temp);
        cont+=1;
      })
      result = methodsList;
      this.data = {"nodes":[],"links":[], "domain":[], "domain2":[]}

      //Creates the nodes and the metrics
      let min= Number.MAX_SAFE_INTEGER;
      let max = Number.MIN_SAFE_INTEGER;
      let min2= Number.MAX_SAFE_INTEGER;
      let max2 = Number.MIN_SAFE_INTEGER;

      cont = 1;
      for (let i = 0; i < result.length; i++) {
        if(result[i].depth==1){ //Used to create the links for the main node
          
          cont+=1
          this.data.links.push({
                    "id": cont,
                    "source": 0,
                    "target": result[i].method.id,
                    //"type": "CALLS"
                  });
        }
        //let metric = result[i].method.icrlavg;
        let metric = this.getMetric(metricType1,result[i].method);
        let metric2 = this.getMetric(metricType2,result[i].method);

        if(min>metric){
          min = metric
        }
        if(max<metric){
          max = metric
        }
        if(min2>metric2){
          min2 = metric2
        }
        if(max2<metric2){
          max2 = metric2
        }
        console.log({
           "name":result[i].method.name,
           "id":result[i].method.id,
           "label":"Method",
           "firstMetric": metric,
           "secondMetric": metric2,
          })
        this.data.nodes.push(
          {
           "name":result[i].method.name,
           "id":result[i].method.id,
           "label":"Method",
           "firstMetric": metric,
           "secondMetric": metric2,
          }
        );
        
      }

      this.data.domain.push(min);
      this.data.domain.push(max);
      this.data.domain2.push(min2);
      this.data.domain2.push(max2);

      console.log("Domain 1:",this.data.domain);
      console.log("Domain 2:",this.data.domain2);
      console.log("Nodes:",this.data.nodes);

      //Creates the links for other nodes (Consider making recursive case 1,2,3)
      for (let i = 1; i < result.length-1; i++) { //Does not evaluate the last because it is already linked
        for (let j = i+1; j < result.length; j++) {
           if(result[i].depth+1== result[j].depth){
             let temp={
                    "id": cont,
                    "source": result[i].method.id,
                    "target": result[j].method.id,
                    //"type": "CALLS"
                  }
              this.data.links.push(temp);
           }
           else if(result[i].depth== result[j].depth){
             break;
           }
        }
      }
      console.log("Links:",this.data.links);
    })
    .catch(error => {
      this.neo4jService.disconnect();
      console.log(error)
      throw error;
    });
    this.render(this.data);
  }

  getMetric(type,method){
    let metric=0;
    if(type==1){
      metric=method.floc
    }
    else if(type==2){
      metric=method.rcyc
    }
    else if(type==3){
      metric=method.fcyc
    }
    else if(type==4){
      metric=method.rloc
    }
    return metric
  }

  ticked() {
    const radiusScale = d3.scaleLinear()
      .domain(this.data.domain)
      .range([10,50]);
  
    this.link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", (d)=> { 
          return this.calculateX(d.target.x, d.target.y, d.source.x, d.source.y,radiusScale(d.target.firstMetric)); 
      })
      .attr("y2", (d)=> { 
          return this.calculateY(d.target.x, d.target.y, d.source.x, d.source.y, radiusScale(d.target.firstMetric));
      });

    this.node.attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});
  }

  dragged(event,d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  dragended(event,d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart()
    d.fx = d.x;
    d.fy = d.y;
  }
  
  dragstarted(event,d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }


  calculateX( tx, ty, sx, sy, radius){
      if(tx == sx) return tx;                 //if the target x == source x, no need to change the target x.
      radius+=8;
      let xLength = Math.abs(tx - sx);    //calculate the difference of x
      let yLength = Math.abs(ty - sy);    //calculate the difference of y
      //calculate the ratio using the trigonometric function
      let ratio = radius / Math.sqrt(xLength * xLength + yLength * yLength);
      if(tx > sx)  return tx - xLength * ratio;    //if target x > source x return target x - radius
      if(tx < sx) return  tx + xLength * ratio;    //if target x < source x return target x + radius
  }
  calculateY(tx, ty, sx, sy, radius){
      if(ty == sy) return ty;                 //if the target y == source y, no need to change the target y.
      radius+=8;
      let xLength = Math.abs(tx - sx);    //calculate the difference of x
      let yLength = Math.abs(ty - sy);    //calculate the difference of y
      //calculate the ratio using the trigonometric function
      let ratio = radius / Math.sqrt(xLength * xLength + yLength * yLength);
      if(ty > sy) return ty - yLength * ratio;   //if target y > source y return target x - radius
      if(ty < sy) return ty + yLength * ratio;   //if target y > source y return target x - radius
  }

  sendNode(nodeSignature){
    console.log("Has team:",this.hasTeam);
    console.log("Clicked node:",nodeSignature);
    if(this.hasTeam && nodeSignature!== undefined){
      let temp = {
        query: nodeSignature,
        metric1: this.searchForm.value.metric1,
        metric2: this.searchForm.value.metric2,
      }
      this.socketioService.sendMessage('teamClick',JSON.stringify(temp));
      console.log("Emmitted team click.");
      this.getData(nodeSignature,temp.metric1, temp.metric2);
    }
    else if(nodeSignature!== undefined){
      this.socketioService.sendMessage('nodeClicked', nodeSignature);
    }
  }

  createSocketSubscriptions(){
    this.socketioService.channelSubscribe('changeNode', (message)=>{
      if(message!=null){
        this.searchForm.value.qualifiedName = message;
        console.log(`Received from server: ${message}`);
        this.getData(message, this.searchForm.value.metric1,this.searchForm.value.metric1);
      }
    });
  }

  onSubmit(){
    let formValue = this.searchForm.value;
    this.currentSearch={
      query:formValue.qualifiedName,
      metric1: formValue.metric1,
      metric2: formValue.metric2
    }
    this.getData(formValue.qualifiedName,formValue.metric1,formValue.metric2);
  }

  onCreateTeam(){
    this.socketioService.sendMessage('createConnection',JSON.stringify(this.currentSearch));
    this.hasTeam=true;
    if(!this.alreadySubscribed){
      this.alreadySubscribed=true;
      this.socketioService.channelSubscribe('teamUpdate', (message)=>{
        console.log(this.searchForm.value.qualifiedName);
        if(message !=null){
          console.log(`Received from server: ${message}`);
          this.currentSearch = JSON.parse(message);
          this.searchForm.value.qualifiedName= this.currentSearch.query;
          this.searchForm.value.metric1 =  this.currentSearch.metric1;
          this.searchForm.value.metric2 =  this.currentSearch.metric2;
          this.getData(this.currentSearch.query, this.currentSearch.metric1,this.currentSearch.metric2);
        }
      });
    }
  }

  onJoinTeam(){
    this.socketioService.sendMessage('joinConnection','team1');
    this.hasTeam=true;
    if(!this.alreadySubscribed){
      this.alreadySubscribed=true;
      this.socketioService.channelSubscribe('teamUpdate', (message)=>{
        console.log(this.searchForm.value.qualifiedName);
        if(message !=null){
          console.log(`Received from server: ${message}`);
          this.currentSearch = JSON.parse(message);
          this.searchForm.value.qualifiedName= this.currentSearch.query;
          this.searchForm.value.metric1 =  this.currentSearch.metric1;
          this.searchForm.value.metric2 =  this.currentSearch.metric2;
          this.getData(this.currentSearch.query, this.currentSearch.metric1,this.currentSearch.metric2);
        }
      });
    }
  }

}
