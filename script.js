
let commentSection = document.querySelector('.comment-section');
let myCommentContainerForm = document.querySelector('.my-comment-container-form');

let xhr = new XMLHttpRequest();
xhr.open("GET", 'data.json', true);

xhr.onreadystatechange = function () {
  if (xhr.readyState === xhr.DONE && xhr.status === 200) {
    let response = JSON.parse(xhr.responseText);
    // console.log(response);
    commentSection.innerHTML = '';
    let comments = response.comments;
    let minLength = 1;
    let storedMessages = [];


    function updateLocalStorageMessage(messageContainer, editedText) {
      let messageId = messageContainer.getAttribute('data-id'); 
      let storedMessages = getLocalMessages();
      let messageToUpdate = storedMessages.find(message => message.messageId === messageId);
      if (messageToUpdate) {
        messageToUpdate.commentText = editedText;
        let jsonMessages = JSON.stringify(storedMessages);
        localStorage.setItem('myMessages', jsonMessages);
      }
    }

    function setLocalMessages(message) {

      let replyToElement = message.querySelector('.username-textblock');
      let replyTo = replyToElement ? replyToElement.textContent: null;
      let  commentContent;
      if (message.querySelector('.username-textblock') !== null) {
        commentContent = message.querySelector('p').textContent.replace(`${message.querySelector('.username-textblock').textContent}`,'');
      } else {
        commentContent = message.querySelector('p').textContent;
      }

      
      let commentData = {
       messageId: `message_${Date.now()}`, 
       CurrentUserName: message.querySelector('.user-name').textContent,
       commentText:  commentContent,
       userAvatar: './images/avatars/image-juliusomo.png',
       messageSendTime: Date.now(),
       commentScore: message.querySelector('.rating-score').textContent,
       isReply: message.classList.contains("reply-message"),
       replyTo: replyTo,
       parentId: message.getAttribute('data-parent-id'),
      };



      storedMessages = getLocalMessages();
      if (typeof storedMessages === 'object' && !Array.isArray(storedMessages)) {
        storedMessages = [];
      } else {
        storedMessages.push(commentData);
      }


      let jsonMessages = JSON.stringify(storedMessages);
      localStorage.setItem('myMessages', jsonMessages);
      // console.log(jsonMessages);
    }


    
    function getLocalMessages() {
      let getLocalMessages = localStorage.getItem('myMessages');
      let parsedMessages = JSON.parse(getLocalMessages);
      // console.log(parsedMessages);
      return parsedMessages;
    }



    function loadMessageFromLocalStorage() {

      let localStorageMessages = getLocalMessages();

      if (localStorageMessages && localStorageMessages.length > 0) {
        for (let localStorageMessage of localStorageMessages) {
          let userMessageContainer = document.createElement('div');
          userMessageContainer.className = 'user-message-container';
          let messageSendTime = new Date(localStorageMessage.messageSendTime);
          let currentTime = new Date();
          let timeDifference = currentTime - messageSendTime;
          let timeAgo = formatTimeDifference(timeDifference);
          
          if (localStorageMessage.parentId) {
            let parentMessage = document.querySelector(`[data-id="${localStorageMessage.parentId}"]`);
            let replyMessageContainer = parentMessage.parentNode;

          if (parentMessage) {
           
            let replyMessage = createMessage(
              localStorageMessage.CurrentUserName,
              localStorageMessage.commentText,
              localStorageMessage.userAvatar, 
              timeAgo,
              localStorageMessage.commentScore,
              localStorageMessage.replyTo,
              localStorageMessage.messageId,
              localStorageMessage.parentId,
            );

            if (localStorageMessage.CurrentUserName === response.currentUser.username) {
              replyMessage.querySelector('.reply-word').textContent = 'Edit';
              replyMessage.querySelector('.reply-arrow').src ='./images/icon-edit.svg';
  
              editNewMessages(replyMessage);
              addDeleteButton(replyMessage, localStorageMessage.messageId);
          } 

            replyMessage.classList.add('reply-message');
            replyMessageContainer.appendChild(replyMessage);
          } 
         
        } else {
          let myNewMessage = createMessage(
            localStorageMessage.CurrentUserName,
            localStorageMessage.commentText,
            localStorageMessage.userAvatar, 
            timeAgo,
            localStorageMessage.commentScore,
            '',
            localStorageMessage.messageId,
          );
          if (localStorageMessage.CurrentUserName === response.currentUser.username) {
            myNewMessage.querySelector('.reply-word').textContent = 'Edit';
            myNewMessage.querySelector('.reply-arrow').src ='./images/icon-edit.svg';

            editNewMessages(myNewMessage);
            addDeleteButton(myNewMessage, localStorageMessage.messageId);
        } 
        if(myNewMessage.className === 'user-message')
          userMessageContainer.appendChild(myNewMessage);
          commentSection.appendChild(userMessageContainer);
        }
      }   
    }
  }

    function commentForm(className) {
      let addCommentForm = document.createElement('form');
      addCommentForm.className = className;

      let myAvatarDiv = document.createElement('div');
      myAvatarDiv.className = 'my-avatar';
      let myAvatarImg = document.createElement('img');
      myAvatarImg.className = 'my-avatar-img';
      myAvatarImg.src = `${response.currentUser.image.png}`;
      myAvatarImg.alt = 'my-avatar';
      myAvatarDiv.appendChild(myAvatarImg);
      addCommentForm.appendChild(myAvatarDiv);
      

      let commentTextrea = document.createElement('textarea');
      commentTextrea.className = 'comment-textform';
      commentTextrea.placeholder = 'Add a comment...';

      addCommentForm.appendChild(commentTextrea);

      let sendButton = document.createElement('button');
      sendButton.className = 'send-button';
      sendButton.type = 'submit';
      sendButton.textContent = 'SEND';
      if (className === 'reply-form') {
        sendButton.textContent = 'REPLY';
      }else if (className === 'edit-form') {
        sendButton.textContent = 'UPDATE';
        sendButton.classList.add('update-button');
      } else {
        sendButton.textContent = 'SEND';
      }
      addCommentForm.appendChild(sendButton);


      if (className === 'edit-form') {
        myAvatarDiv.style.display = 'none';
        commentTextrea.classList.add('edit-textform');
      }
      
      return addCommentForm;
    }

    if (response.currentUser) {
      myCommentContainerForm.appendChild(commentForm('add-comment-form'));
    }

    function createMessage(userName, commentText, userAvatar, messageSendTime, commentScore, replyTo, dataId, parentId) { 



      let newMessageDiv = document.createElement('div');
      newMessageDiv.className = 'user-message';

      let userInfoUl = document.createElement('ul');
      userInfoUl.className = 'user-info';

      let userAvatarLi = document.createElement('li');
      userAvatarLi.className = 'user-avatar user-message-info';
      let userAvatarImg = document.createElement('img');
      userAvatarImg.className = 'user-avatar-img';
      userAvatarImg.src = userAvatar;
      userAvatarImg.alt = 'user-avatar';
      userAvatarLi.appendChild(userAvatarImg);

      let userNameLi = document.createElement('li');
      userNameLi.className = 'user-name user-message-info';
      userNameLi.textContent = userName;

      let messageSendTimeLi = document.createElement('li');
      messageSendTimeLi.className = 'message-send-time user-message-info';
      messageSendTimeLi.textContent = messageSendTime;


      userInfoUl.appendChild(userAvatarLi);
      userInfoUl.appendChild(userNameLi);

      if (userName === response.currentUser.username) {
        let mySignSpan = document.createElement('span');
        mySignSpan.className = 'my-sign';
        mySignSpan.textContent = 'you';
        userInfoUl.appendChild(mySignSpan);

 } 

      userInfoUl.appendChild(messageSendTimeLi);

      let userRatingContainerDiv = document.createElement('div');
      userRatingContainerDiv.className = 'user-rating-container';
      
      let increaseRatingDiv = document.createElement('div');
      increaseRatingDiv.className = 'increase-rating';

      let ratingScoreSpan = document.createElement('span');
      ratingScoreSpan.className = 'rating-score';
      ratingScoreSpan.textContent = commentScore;

      let decreaseRatingDiv = document.createElement('div');
      decreaseRatingDiv.className = 'decrease-rating';

      userRatingContainerDiv.appendChild(increaseRatingDiv);
      userRatingContainerDiv.appendChild(ratingScoreSpan);
      userRatingContainerDiv.appendChild(decreaseRatingDiv);

      let messageTextblockDiv = document.createElement('div');
      messageTextblockDiv.className = 'message-textblock';

      let messageTextblockSpan = document.createElement('span');
      messageTextblockSpan.className = 'username-textblock';
      messageTextblockSpan.textContent = replyTo;
      let messageTextBlockContent = document.createElement('p');
      messageTextBlockContent.textContent =  commentText;
      messageTextBlockContent.insertBefore(messageTextblockSpan, messageTextBlockContent.firstChild);
      messageTextblockDiv.appendChild(messageTextBlockContent);
      
      if (replyTo === undefined) {
        messageTextblockSpan.remove();
      }

      let replyOnMessageDiv = document.createElement('div');
      replyOnMessageDiv.className = 'reply-on-message';

      let replyArrowImg = document.createElement('img');
      replyArrowImg.className = 'reply-arrow';
      replyArrowImg.src = './images/icon-reply.svg';
      replyArrowImg.alt = 'reply-arrow';
      replyOnMessageDiv.appendChild(replyArrowImg);

      let replyWordSpan = document.createElement('span');
      replyWordSpan.className = 'reply-word';
      replyWordSpan.textContent = 'Reply';
      replyOnMessageDiv.appendChild(replyWordSpan);

      newMessageDiv.appendChild(userInfoUl);
      newMessageDiv.appendChild(userRatingContainerDiv);
      newMessageDiv.appendChild(messageTextblockDiv);
      newMessageDiv.appendChild(replyOnMessageDiv);
  
      newMessageDiv.setAttribute('data-parent-id', parentId);
      if (parentId == undefined || parentId == null) {
        newMessageDiv.removeAttribute('data-parent-id');
      }

      if (dataId) {
        newMessageDiv.setAttribute('data-id', dataId);
      }

      return newMessageDiv;
    }

    function userRating() {
      let userRatingContainers = document.querySelectorAll('.user-rating-container');
      for (let userRatingContainer of userRatingContainers) {
        let ratingScore = userRatingContainer.querySelector('.rating-score');
        let increaseRating = userRatingContainer.querySelector('.increase-rating');
        let decreaseRating = userRatingContainer.querySelector('.decrease-rating');
        let ratingChanged = false;
    
        let userName = userRatingContainer.closest('.user-message').querySelector('.user-name').textContent;
        
        if (userName !== response.currentUser.username) {
          increaseRating.addEventListener('click', () => {
            if (!ratingChanged) {
              ratingScore.textContent = parseInt(ratingScore.textContent) + 1;
              ratingChanged = true;
            }
          });
    
          decreaseRating.addEventListener('click', () => {
            if (!ratingChanged) {
              ratingScore.textContent = parseInt(ratingScore.textContent) - 1;
              ratingChanged = true;
            }
          });
        }
      }
    }


    function showEditForm(initialText, messageContainer) {
      let editForm = commentForm('edit-form');
      let editButton = messageContainer.querySelector('.reply-on-message');
      if (editForm) {
        editButton.style.pointerEvents = 'none';
      }

      let editTextarea = editForm.querySelector('.comment-textform');
      editTextarea.value = initialText;
    
      let saveButton = editForm.querySelector('.send-button');
      saveButton.textContent = 'UPDATE';
    
      messageContainer.querySelector('.message-textblock p').style.display = 'none';
    
      messageContainer.appendChild(editForm);
    
      editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        editButton.style.opacity  = '1.0';
        editButton.style.pointerEvents = 'auto';
        let editedText = editTextarea.value;
        messageContainer.querySelector('.message-textblock p').textContent = editedText;
        messageContainer.querySelector('.message-textblock p').style.display = 'block';
        editForm.style.display = 'none';

        updateLocalStorageMessage(messageContainer, editedText)
      });
    }


    function editNewMessages(messageContainer) {
      let editButton = messageContainer.querySelector('.reply-on-message');
      editButton.addEventListener('click', () => {
        let messageText;
        if (messageContainer.querySelector('.username-textblock') !== null) {
          messageText = messageContainer.querySelector('p').textContent.replace(`${messageContainer.querySelector('.username-textblock').textContent}`,'');
        } else {
          messageText = messageContainer.querySelector('.message-textblock p').textContent;
        }
        showEditForm(messageText, messageContainer);
       });
     }

    
    let addComment = document.querySelector('.add-comment-form');
    let commentTextform = document.querySelector('.comment-textform');
    let sendButton;


    function updateSendButtonStatus(textcontent, button) {
      if (textcontent.value.length >= minLength) {
        button.disabled = false;
      }else {
        button.disabled = true;
      }
    }

    function addDeleteButton(messageContainer,  messageId) {
      let deleteMessageButtonDiv = document.createElement('div');
      deleteMessageButtonDiv.className = 'delete-message-button';
  
      let deleteMessageButtonIcon = document.createElement('img');
      deleteMessageButtonIcon.className = 'delete-icon';
      deleteMessageButtonIcon.src =  './images/icon-delete.svg';
      deleteMessageButtonIcon.alt = 'icon-delete';
  
      let deleteMessageButtonSpan = document.createElement('span');
      deleteMessageButtonSpan.className = 'delete-word';
      deleteMessageButtonSpan.textContent = 'Delete';
  
      deleteMessageButtonDiv.appendChild(deleteMessageButtonIcon);
      deleteMessageButtonDiv.appendChild(deleteMessageButtonSpan);
      messageContainer.appendChild(deleteMessageButtonDiv);
  
      deleteMessageButtonDiv.addEventListener('click', () => {
        deleteMessage(messageContainer,  messageId);
      });
    }


  function deleteMessage(message,  messageId) {
    let modalDeleteMessage = document.querySelector('.modal-delete-message');
        modalDeleteMessage.style.display = 'flex';
        let cancelButton = modalDeleteMessage.querySelector('.button-cancel');
        let deleteButton = modalDeleteMessage.querySelector('.button-delete');

        cancelButton.addEventListener('click', function(event) {
          event.preventDefault();
          modalDeleteMessage.style.display = 'none';
        });

        deleteButton.addEventListener('click', function(event) {
          event.preventDefault();
          if (message.classList.contains('reply-message')) {
            message.remove();
            modalDeleteMessage.style.display = 'none';
          } else {
            message.parentNode.remove();
            modalDeleteMessage.style.display = 'none';   
          }
        let allLocalMessages = getLocalMessages();
        let updatedMessages = allLocalMessages.filter((message) => message.messageId !== messageId);
        let jsonMessages = JSON.stringify(updatedMessages);
        localStorage.setItem('myMessages', jsonMessages);
        });
  }


  function formatTimeDifference(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds} seconds ago`;
    } else {
      let minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
          return `${minutes} minutes ago`;
        } else {
          let hours = Math.floor(minutes / 60);
          if (hours < 24) {
            return `${hours} hours ago`;
          } else {
            let days = Math.floor(hours / 24);
            if (days < 7) {
              return `${days} days ago`;
            } else {
              let weeks = Math.floor(days / 7);
              if (weeks < 4) {
                return `${weeks} weeks ago`;
              } else {
                let months = Math.floor(days / 30.42 );
                if (months < 12) {
                  return `${months} months ago`;
                } else {
                  let years = Math.floor(days / 365.24);
                  return `${years} years ago`;
                }
              }
            }
          }
        }
      }
    }

  function sendTime(messageSendTime) {
    let now = new Date();
    let mesageTime = new Date(messageSendTime);
    let timeDifference = now - mesageTime;
      

      let timeAgo = formatTimeDifference(timeDifference);
      return timeAgo;
    }


    let messageSendTimes = {};
  
    if (addComment) {
      sendButton = addComment.querySelector('.send-button');
      sendButton.disabled = true;
      commentTextform.addEventListener('input',   function () {
        updateSendButtonStatus(commentTextform, sendButton); 
      });
  addComment.addEventListener('submit', function(event) {
    event.preventDefault();
    let messageId = Date.now(); 
    messageSendTimes[messageId] = new Date();
    let myMessage = createMessage(response.currentUser.username, commentTextform.value, response.currentUser.image.png,
     0,                                     
      0
    );

    
    myMessage.querySelector('.message-send-time').textContent = sendTime(messageSendTimes[messageId]);
    myMessage.querySelector('.reply-word').textContent = 'Edit';       
    myMessage.querySelector('.reply-arrow').src ='./images/icon-edit.svg';

    let userMessageContainer = document.createElement('div');
    userMessageContainer.className = 'user-message-container';
    userMessageContainer.appendChild(myMessage);
    commentSection.appendChild(userMessageContainer);
    commentTextform.value = ''; 

    editNewMessages(myMessage);
    addDeleteButton(myMessage);
    sendButton.disabled = true;
    setLocalMessages(myMessage); 

    
      });
    }

    for (let comment of comments) {

      let userMessageContainer = document.createElement('div');
      userMessageContainer.className = 'user-message-container';

      let pageMessage = createMessage( `${comment.user.username}`, `${comment.content}`,  `${comment.user.image.png}`, `${comment.createdAt}`, `${comment.score}`,``, `${comment.id}`);
      userMessageContainer.appendChild(pageMessage);



      if (`${comment.user.username}` === response.currentUser.username) {
        pageMessage.querySelector('.reply-word').textContent = 'Edit';
        pageMessage.querySelector('.reply-arrow').src ='./images/icon-edit.svg';

        editNewMessages(pageMessage);
        addDeleteButton(pageMessage);
    } 

      if (comment.replies && comment.replies.length > 0) {

        for (let reply of comment.replies) {        
          let replyMessage = createMessage(`${reply.user.username}`, `${reply.content}`,  `${reply.user.image.png}`, `${reply.createdAt}`, `${reply.score}`, `@${reply.replyingTo} `, `${reply.id}`,`${comment.id}`);
          replyMessage.classList.add('reply-message'); 

          if (`${reply.user.username}` === response.currentUser.username) {
            replyMessage.querySelector('.reply-word').textContent = 'Edit';
            replyMessage.querySelector('.reply-arrow').src ='./images/icon-edit.svg';
            editNewMessages(replyMessage);
            addDeleteButton(replyMessage);
          } 

        userMessageContainer.appendChild(replyMessage);   

        }
      }
        commentSection.appendChild(userMessageContainer);
    }

    

    let replyButtons = document.querySelectorAll('.reply-on-message');
        replyButtons.forEach(function(replyButton) {
          replyButton.addEventListener('click', function(event) {
            event.preventDefault();
    
            let userMessage = replyButton.closest('.user-message');
            let userMessageContainer = userMessage.closest('.user-message-container');
            let replyForm = commentForm('reply-form');
            let replyTextarea = replyForm.querySelector('.comment-textform');
            let username = userMessage.querySelector('.user-name').textContent;

            let allReplyForms = document.querySelectorAll('.reply-form');
            allReplyForms.forEach(function(form) {
            if (form.closest('.user-message') !== userMessage) {
            form.remove();
               }
             });

            if (replyForm) {
              replyTextarea.value = `@${username}, `;
              if (userMessage.classList.contains('reply-message')) {
                replyForm.style.width = '88%';
                replyTextarea.style.width = '70%';
              }
            }
       
              replyForm.addEventListener('submit', function(event) {
                event.preventDefault();

                let messageId = Date.now(); 
                messageSendTimes[messageId] = new Date();
                let messageText = replyTextarea.value.replace(`@${username}, `, '');     
                let myMessage = createMessage(response.currentUser.username, messageText, response.currentUser.image.png, 
                  0,                                   
                  0,
                  `@${username} `,
                  '',
                  `${userMessage.getAttribute('data-id')}`,
                );

                myMessage.classList.add('reply-message');
                myMessage.querySelector('.reply-word').textContent = 'Edit';       
                myMessage.querySelector('.reply-arrow').src ='./images/icon-edit.svg';
                myMessage.querySelector('.message-send-time').textContent = sendTime(messageSendTimes[messageId]);
                userMessageContainer.appendChild(myMessage);
                commentTextform.value = '';
                replyForm.remove();

                editNewMessages(myMessage)
                addDeleteButton(myMessage);
                setLocalMessages(myMessage); 

            });
            userMessageContainer.appendChild(replyForm);
            if (userMessage.querySelector('.reply-word').textContent === 'Edit' && userMessage.querySelector('.user-name').textContent === response.currentUser.username) {
              replyForm.remove();
            }
          });
        });
        // localStorage.clear();
        loadMessageFromLocalStorage();
        userRating();

  }
}

xhr.send();









