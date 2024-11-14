window.onload = function () {
  let currentPage = 2; // 현재 페이지
  let isLoading = false; // 데이터 로딩 여부 체크


  async function loadMoreFeeds() {
    if (isLoading) return;  // 로딩 중일 때는 중복 요청을 방지
    isLoading = true;  // 로딩 시작

    try {
      const response = await fetch(`/get-feeds?page=${currentPage}`);
      const data = await response.json();

      const feedContainer = document.querySelector('.feed-container');

      if (data && data.feeds.length > 0) {
        const sessionNickname = data.feedNickname;

        data.feeds.forEach(feed => {
          const feedElement = document.createElement('div');
          feedElement.classList.add('feed-item'); // 'feed-item' 클래스 추가
          feedElement.setAttribute('data-feed-id', feed.id); // 'data-feed-id' 속성 추가 및 값 설정

          const buttonHtml = feed.user.nickname === sessionNickname
            ? `<button type="button" class="imgButton modify" onclick="feedEdit(${feed.id})"></button>
               <button type="button" class="imgButton delete" onclick="feedDelete(${feed.id})"></button>`
            : '';
          
            // 피드 생성 html
            feedElement.innerHTML = `
              <div class="content">
                <div class="user-info">
              <div class="profile-img">
                <img
                  src="/static/img/profile.png"
                  alt="프로필 이미지"
                  width="30px"
                />
              </div>
              <strong>${feed.user.nickname}</strong>
            </div>

            <div id="feed-img-${feed.id}">
              <img src="${feed.file_url}" alt="post" />
            </div>

            <div id="feed-content-${feed.id}" style="padding : 10px;">
                <p>${feed.content}</p>
            </div>

            <div class="edit-container" id = "edit-container-${feed.id}" style = "display: none;">
              <div class="file-upload-container">
                <input type="file" id="img-input-${feed.id}" onchange="updateImage(${feed.id},'${feed.file_url}')">
                <label class="label-file" for="img-input-${feed.id}">파일선택</label>
              <div class="file-info-container">
                  <span class="span-file">선택된 파일이 없습니다.</span>
                  <div class="error-message" style="color: red; display: none; font-size: 13px; margin-top: 5px;">
                    [ERROR!] 확장자는 jpeg, jpg, png, bmp만 가능합니다.
                  </div>
              </div>
             </div>
    
      
               <img src="${feed.file_url}" id ="edit-img-${feed.id}" class = "edit-img" alt="이미지 수정">
               <div class="edit-container" style="margin-top: 7px;">
                <textarea id="edit-content-${feed.id}" class="edit-textarea" placeholder="수정할 내용을 입력하세요">${feed.content}</textarea>
                 <div class="button-container">
                  <button type="button" onclick="saveChanges(${feed.id})" class="btn save-btn">저장</button>
                  <button type="button" onclick="cancelEdit(${feed.id})" class="btn cancel-btn">취소</button>     
                 </div>
              </div>
               
            </div>

            <div id="like-info-${feed.id}" data-feed-id="${feed.id}" class="like-info" onclick="openLikeModal(${feed.id})">
              <span id="like-text-${feed.id}"></span>
            </div>   

            <div class="icon-container">
              <div class="left-icons">
                <svg id="likeIcon-${feed.id}" class = "likeIcon" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" onclick="toggleLike(${feed.id})">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                </svg>
                <img src="../static/svg/chat.svg" alt="채팅 아이콘" onclick="toggleCommentBox('<%= feed.id %>')"/>
              </div>

              <!-- 좋아요 모달 -->
              <div id="likeModal-${feed.id}" class="like-modal" data-feed-id="${feed.id}">
                <div class="like-modal-content">
                  <span class="close" onclick="closeLikeModal(${feed.id})">&times;</span>
                  <h2>이 피드를 좋아한 사람들의 목록</h2>
                  <ul style="list-style: none; padding : 0; margin : 0;border-bottom : none" id="likes-list-${feed.id}">
                    <!-- 좋아요 목록이 여기에 표시됨 -->

                  </ul>
                </div>
              </div>

              <div class="right-icons">
                ${buttonHtml} 
              </div>
            </div>
          </div>
            `;
            feedContainer.appendChild(feedElement);

        }); // end foreach

        currentPage++ // 페이지 번호 증가
        // 모든 피드가 추가된 후 좋아요 상태와 카운트 업데이트
       // 새로 추가된 피드의 좋아요 상태와 좋아요 수 업데이트
       const newFeedIds = data.feeds.map(feed => feed.id);
       updateLikeCounts(newFeedIds);
       setLikeStatusOnPageLoad();
      } // end if
     isLoading = false; // 로딩 종료
    } // end try 
     catch (error) {
      console.error('Error loading moer feeds : ', error);
      isLoading = false; // 에러가 나면 로딩 종료
    } // end catch
  }

  // 스크롤 이벤트 핸들러
  window.addEventListener("scroll", () => {
    // 페이지 끝에 도달하면 데이터 요청
    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 100
    ) {
      loadMoreFeeds(); // 추가 데이터
    }
  });


    // 각 피드 좋아요 수 가져와서 업데이트
    async function updateLikeCounts (feedIds) {
      for (const feedId of feedIds) {
        try {
          const response = await fetch(`/get-like-count?feedId=${feedId}`);
          const { likeCount } = await response.json();
  
          const likeText = document.getElementById(`like-text-${feedId}`);
          if (likeCount > 0) {
            likeText.textContent = `${likeCount}명이 해당 게시물에 공감하고 있어요`;
          } else {
            likeText.textContent = '아직 공감한 사람이 없습니다.';
          }
        } catch (error) {
          console.error('error');
        }
      }
    }
   


  function updateImage(feedId,fileUrl) {

    // 기존 이미지
    const baseFileUrl = fileUrl;
    // input file
    const input = document.getElementById(`img-input-${feedId}`);
    // 사용자가 이미지를 변경하면 이미지 src값을 변경
    const imgPreview = document.getElementById(`edit-img-${feedId}`);
    // 사용자가 어떤 파일을 선택했는지
    const spanFileName = input.nextElementSibling.nextElementSibling;

    // 사용자가 하나의 파일을 선택했을때만 실행한다.
    if (input.files && input.files[0]) {
      const reader = new FileReader();

      // 파일 이름 표시
      spanFileName.textContent = input.files[0].name;
      // 이미지 미리보기 업데이트
      reader.onload = function (e) {
        imgPreview.src = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      spanFileName.textContent = "선택된 파일이 없습니다.";
      imgPreview.src = `${baseFileUrl}`; // 초기 이미지로 재설정
    }
  }



  // 페이징 처리 시, 서버에서 받아온 좋아요 상태에 따라 하트 아이콘을 업데이트
async function setLikeStatusOnPageLoad() {
  try {
    const response = await fetch('/get-like-status');
    const feedLikeStatus = await response.json();


    // 각 피드에 대해 좋아요 상태를 업데이트
    feedLikeStatus.forEach(({ feedId, liked }) => {
      const heartIcon = document.getElementById(`likeIcon-${feedId}`);
      if (heartIcon) {
        if (liked) {
          heartIcon.classList.add('liked'); // 좋아요가 되어 있으면 하트 아이콘 활성화
        } else {
          heartIcon.classList.remove('liked'); // 좋아요가 되어 있지 않으면 비활성화
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch like status', error);
  }
}


}
