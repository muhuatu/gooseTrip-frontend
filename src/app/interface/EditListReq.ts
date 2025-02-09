export interface editListReq {
  journeyId: number;
  journeyName: string;
  totalDays: number;
  editingDays: number[]; // 編輯中的天數
}

