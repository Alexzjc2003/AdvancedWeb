import { Injectable } from '@angular/core';
import { KnowledgeService } from '@app/three/service/knowledge.service';


@Injectable({
  providedIn: 'root',
})
export class NoticePart {

  noticeCoolDown: boolean = true;

  constructor(private knowledge: KnowledgeService) { }

  showNotice(theme: string) {
    let self = this;
    if (!this.noticeCoolDown) {
      return;
    }

    self.noticeCoolDown = false;
    setTimeout(() => {
      self.noticeCoolDown = true;
    }, 2000);

    let noticeContainer = document.getElementById('notice-container');
    if (noticeContainer == undefined) return;

    const items = this.knowledge.getKnowledge(theme);
    if (items.length == 0) return;

    noticeContainer.innerHTML = '';
    const themeTitle = document.createElement('p');

    themeTitle.textContent = `关于 ${theme} 的提示：`;

    const ul = document.createElement('ul');
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = `${item.title}: ${item.content}`;
      ul.appendChild(li);
    });

    noticeContainer.appendChild(themeTitle);
    noticeContainer.appendChild(ul);
  }
}