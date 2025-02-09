export interface hotel{
  webName : string,
  name : string,
  currency : string,
  oneNightPrice : number,
  allPrice : number,
  opinion : number,
  url : string,
  img : string,
}
export interface room{
  roomType : string,
  bedType : string[],
  currency : string,
  oneNightPrice : number,
  allPrice : number,
  hightFloor:boolean,
  infantBed :string | null;
  notificationList : string[],
  maxMemberAdults : number,
  maxMemberChildren : number,
  img : string,
  number:number,
}
