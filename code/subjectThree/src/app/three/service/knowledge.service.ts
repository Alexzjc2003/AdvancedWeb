import { Injectable } from '@angular/core';
import { noticesMap } from '@app/data/allNotices';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {
  preset: { [key: string]: { "title": string, "content": string }[] };
  constructor() {
    this.preset = noticesMap;
  }

  getKnowledge(theme: string) {
    if(theme in this.preset){
      return this.preset[theme];
    }
    return [];
  }
}

