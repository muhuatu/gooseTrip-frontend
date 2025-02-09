import { Component } from '@angular/core';
import { HttpClientService } from '../../http-serve/http-client.service';
import { Router } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';


@Component({
  selector: 'app-chatroom-list',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './chatroom-list.component.html',
  styleUrl: './chatroom-list.component.scss'
})
export class ChatroomListComponent {

  constructor(private http: HttpClientService, private router: Router) {}

   // get user mail
  // get all chat rooms of the user
  list: Array<any> = [
    {
      journeyName: '決裂的火鍋趴踢',
      invitation: 'ahe78yh5'
    },
    {
      journeyName: '衛武營聖誕市集與高雄一日遊',
      invitation: 'bhegwyh5'
    },
    {
      journeyName: '台南二日遊',
      invitation: 'ce78yh51'
    },
    {
      journeyName: '台中二日遊',
      invitation: 'dhe7efh5'
    },
  ];


  // get uerMail from service
  ngOnInit(): void {
    // this.http.getApi('http://localhost:8080/chat/find_chatrooms').subscribe((res) => {
    //   console.log(res);
    // })
  }


  enterChatRoom() {
    const chats = document.getElementById('chats');
    if (chats) {
      // Toggle visibility of the chat list
      chats.style.display = chats.style.display === 'none' ? 'block' : 'none';

      // Clear existing chat list for demonstration (optional)
      chats.innerHTML = '';
      const title = document.createElement('p');
      title.textContent = '聊天室列表';
      title.setAttribute(
        'style',
        'padding: 10px; margin: 5px; text-align: center; color: black; border-radius: 5px; font-weight: bold;'
      )
      chats.appendChild(title);
      // Add new chat list items
      for (let index = 0; index < this.list.length; index++) {
        const chatItem = document.createElement('p');
        chatItem.textContent = this.list[index].journeyName;
        chatItem.setAttribute(
          'style',
          'padding: 10px; margin: 5px; color: black; background-color: #f2e9eb; border-radius: 5px; border: 1px solid #f5c170; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; cursor: pointer;'
        );
        chats.appendChild(chatItem);
        // while mouse on element change background color
        chatItem.addEventListener('mousemove', () => {
          chatItem.style.backgroundColor = '#f5c170';
        })
        // while mouse move out element change background color back to original color
        chatItem.addEventListener('mouseout', () => {
          chatItem.style.backgroundColor = '#f2e9eb';
        })
        chatItem.addEventListener('click', () => {
          console.log(this.list[index].invitation);
          // navigate to chat room
          // this.router.navigate(['/chatroom', this.list[index].invitation]);
          // this.router.navigate(['/chatroom']);
        });


      }
    }
  }
}



