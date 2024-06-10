import { Injectable } from '@angular/core';
import { KnowledgeService } from '@app/three/service/knowledge.service';
import { LoadResourceService } from '@app/three/service/load-resource.service';
import { NotificationService } from '@app/three/service/notification.service';
import { UserService } from '@app/user/service/user.service';
import { WebSocketService } from '@app/utils/service/websocket.service';
import * as THREE from 'three';
import { LoadResourcePart } from './load-resource';



@Injectable({
    providedIn: 'root',
})
export class NoticePart {
    
    constructor(private knowledge: KnowledgeService) { }

    showNotice(theme: string) {
        let noticeContainer = document.getElementById('notice-container');
        if (noticeContainer == undefined) return;
    
        noticeContainer.innerHTML = '';
        const themeTitle = document.createElement('p');
        themeTitle.textContent = `关于 ${theme} 的提示：`;
    
        const ul = document.createElement('ul');
        const items = this.knowledge.getKnowledge(theme);
    
        items.forEach(function (item) {
          const li = document.createElement('li');
          li.textContent = `${item.title}: ${item.content}`;
          ul.appendChild(li);
        });
    
        noticeContainer.appendChild(themeTitle);
        noticeContainer.appendChild(ul);
      }
}