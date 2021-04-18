export class AvibMethod{

  id: any;
  method: string;
  name: string;
  calledby: number;
  calls: number; 
  cyc: number;
  fcyc: number; 
  fhal: number;
  floc: number;
  fnom: number;
  hal: number;
  iscollapsed: number;
  ismethod: number;
  isrecursive: number;
  isscc: number;
  loc: number;
  nom: number;
  rcyc: number;
  rhal: number;
  rloc: number;
  rnom: number;
  sccid: number;

  constructor(method,id,calls){
    this.id=id;
    this.method=method.method;
    this.name=method.name;
    this.calledby=method.calledby.low;
    this.calls=method.calls.low;
    this.cyc=method.cyc.low;
    this.fcyc=method.fcyc.low;
    this.fhal=method.fhal.low;
    this.floc=method.floc.low;
    this.fnom=method.fnom.low;
    this.hal=method.hal.low;
    this.iscollapsed=method.iscollapsed.low;
    this.ismethod=method.ismethod.low;
    this.isrecursive=method.isrecursive.low;
    this.isscc=method.isscc.low;
    this.loc=method.loc.low;
    this.nom=method.nom.low;
    this.rcyc=method.rcyc.low;
    this.rhal=method.rhal.low;
    this.rloc=method.rloc.low;
    this.rnom=method.rnom.low;
    this.sccid=method.sccid.low;
  }
}