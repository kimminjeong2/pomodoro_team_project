# 데이터베이스

## User Table

- id : Task Table의 user_id로 외래키 지정
- real_name
- nickname
- emailAddr
- password
- phoneNumber
- created_at
- update_at
- profile_url  : 평소 null 값 > url 있을 경우 이미지 표시

---

## Task Table

- id : 일정 튜플의 고유 id
- user_id : 사용자 식별
- title : 일정 제목
- description : 세부 일정
- due_date : 연도 월 일로 언제 일정으로 추가했나.
- created_at : 일정 작성 시간
- update_at : 일정이 수정됐을 경우 시간을 기입한다.(기본으로 null)
- state : done(완료), ongoing(진행중), pending(보류됨)
일정의 현재 상태로 기본적으로 pending > 버튼 클릭에 따라 상태 업댓
- duration: 해당 일정이 끝났을때의 타이머 시간 기록 (lap 기능)

---

## Feed Table

- id : 몇번째 피드인가에 대한 고유값 
image Table의 `feed_id`로 외래키 지정
- userid : 사용자 식별
- content
- created_at : 작성당시 시간

---

## **Image Table**

- id : 이미지 고유 ID
- feed_id : 해당 이미지가 속한 피드의 ID
- url : 이미지 URL
- updated_at : 업로드된 시간

---

## Comment Table

- id
- feed_id : 외래키
- user_id : 외래키
- content
- created_at

---

## Timer Table

- id
- timer id : 현재 기록된 시간 데이터에 대한 id (자동)
- user_id : 사용자 id
- task_id :
- duration :
- start_time :
- end_time :
- created_at :

---

## PomoTimer Table

- id
- timer id : 현재 기록된 시간 데이터에 대한 id (자동)
- user_id : 사용자 id
- task_id :
- duration :
- start_time :
- end_time :
- created_at :

# 회원가입

- 모든 정보를 입력하고 회원가입 버튼을 누른다 - post 요청
    
    User Table에 데이터가 입력 된다. 
    
    <aside>
    💡
    
    사용하는 DB - User Table
    
    - real_name
    - emailAddr
    - password
    - nickname
    - phoneNumber
    </aside>
    

# 로그인

- 이메일과 비밀번호를 입력하고 로그인 버튼을 누른다 - post 요청
    
    User Table과 대조해서 회원정보가 일치하면 로그인 성공 및 페이지 이동
    
    <aside>
    💡
    
    사용하는 DB - User Table 
    
    - emailAddr
    - password
    </aside>
    

# 이메일 찾기 & 비밀번호 재설정

## 이메일 찾기

- 이름과 전화번호를 받고 이메일 찾기 버튼을 누른다. - post 요청
- User 테이블과 대조해서 이메일을 찾는다.
- 모달창에 이메일을 담아서 출력

<aside>
💡

사용하는 DB - User Table

- real_name
- phoneNumber
</aside>

## 비밀번호 찾기

- 필수 탭에서 사용자 정보를 입력받는다.
- 이메일과 새로 설정할 비밀번호,
 비밀번호 확인을 입력 받는다. (비밀번호와 일치해야한다.)

<aside>
💡

사용하는 DB - User Table

- emailAddr
- password
</aside>

# 피드

## 생성: 생성 버튼을 눌렀을 때

- 사용자의 id를 통해 User Table의 이미지 url을 불러온다.
- input_file로 이미지를 불러온다.
- 내용을 입력 받는다.

생성 버튼을 누른다. 

- 피드 테이블에 데이터가 추가된다.

<aside>
💡

사용하는 DB - User Table, Feed Table

- User Table - id
- Feed Table - id
- Feed Table - user_id ( Foreign Key :  User Table의 profile_image, nickname 불러오기 )
- Feed Table - content
- Feed Table - created_at
</aside>

## 피드 페이지 : 피드들 불러올때

1. 컨트롤러에서 메인 페이지 ejs를 랜더한다. 
2. 메인 페이지에게 모델에서 feed table의 데이터를 findall로 전부
받아와 데이터를 넘겨준다. 
3. 메인 페이지 ejs 속에서 피드 ejs 을 반복문으로 렌더시킨다. 
4. 해당 피드 id에 속해있는 댓글이 몇개인지 세어서 아이콘 옆에 표시

<aside>
💡

사용하는 DB - User Table, Feed Table, Comment Table

- User Table - id
- Feed Table - id
- Feed Table - user_id ( Foreign Key : User Table의 profile_image, nickname 불러오기 )
- Feed Table - content
- Feed Table - created_at
- Comment Table - feed_id ( Foreign Key : Feed Table의 id값을 가져와서 댓글 수 확인 )
</aside>

## 댓글 쓰기

- 댓글을 입력받는다.
- 등록 버튼을 누르면 데이터가 서버로 전송된다.
- 비동기 통신으로 보낸다.
    - 댓글 id는 자동갱신
    - 불러올때 사용했던 
    해당 피드의 id값을 등록시킨다.
    - 유저의 정보도 저장시킨다.

## 댓글 불러오기

- 댓글 아이콘을 누르면
- 해당 피드의 id 값을 불러온다.
- 댓글 모달창이 뜬다.
- 모달창이 뜰때 db에서 피드 id 값에 해당하는 댓글을 
전부 찾아서 업로드를 시켜준다.

<aside>
💡

사용하는 DB - User Table, Feed Table, Comment Table

- User Table - id
- Feed Table - id
- Feed Table -  user_id ( Foreign Key : User Table의 profile_image, nickname 불러오기 )
- Comment Table - id
- Comment Table - feed_id ( Foreign Key : Feed Table의 id값을 가져옴 )
- Comment Table - user_id ( Foreign Key : User Table의 id값을 가져옴 )
- Comment Table - comment
</aside>

# 일정 관리

## 일정 추가

- 클라이언트 측에서 오늘이 며칠인지 몇월인지 표시한다.
- 일정 추가 버튼으로 일정을 추가시키는 양식을 띄운다.
- 주제와 세부 내용을 입력 받는다.
- 추가를 누르면 비동기로 서버에 전송된다.
    - 해당 날짜 (연도, 월, 일)
    - 주제 (title)
    - 내용 (desription) 등

<aside>
💡

사용하는 DB - User Table, Task Table

User Table - id

Task Table - id

Task Table - user_id ( Foreign Key : User Table의 id 값을 받아옴 )

Task Table - title

Task Table - description

Task Table - due_date

Task Table - created_at

</aside>

## 일정 불러오기

- 메뉴바의 Todo_list 메뉴버튼을 누른다.
- 페이지가 랜더링 되면서 일정을 불러온다.
    - 사용자의 id
    - 오늘 날짜를 바탕으로
- 일정을 표시하는 블록을 하나의 ejs로 만든다.
- todo-list 페이지 내부에서 일정 블록을 반복문으로 랜더링한다.
- todo-list 페이지 랜더할때 
컨트롤러에서 모델을 통해 일정 데이터 불러와서 넣어준다.

<aside>
💡

사용하는 DB - User Table, Task Table

User Table - id

Task Table - id

Task Table - user_id ( Foreign Key : User Table의 id 값을 받아옴 )

Task Table - title

Task Table - description

Task Table - due_date

Task Table - state

</aside>

# 타이머

상단의 타이머 부분과 

하단의 일정 부분으로 나눠서 정리한다. 

## 일정 부분

타이머 페이지를 누르면 페이지가 렌더링 된다. 

- 오늘 날짜
- userid

두가지 데이터를 바탕으로 일정을 불러온다. 

일정의 상태 버튼을 누를때마다 비동기 통신으로 

db가 그때그때 업데이트 된다. 

<aside>
💡

사용하는 DB - User Table, Task Table

User Table - id

Task Table - user_id ( Foreign Key : User Table의 id 값을 받아옴 )

Task Table - title : Task의 title

Task Table - description : Task의 description

Task Table - due_date : Task의 due_date

Task Table - state : Task의 state(상태) → “pending”, “ongoing”, “done”

Task Table - duration : Task의 총 걸린 시간 → default 값 : 0

</aside>

## 타이머 부분

시작버튼을 누르기 전에는 화살표로 둘 중 하나를 선택할 수 있다. 

- 뽀모도로 타이머
- 일반 타이머

<aside>
💡

둘 중 하나의 시작 버튼을 누르면 
나머지 한쪽으로 이동하는 화살표 비활성화해서 막는다. 

</aside>

<aside>
💡

사용하는 DB - User Table, Task Table, Timer Table

User Table - id

Task Table - id

Timer Table - user_id ( Foreign Key : User Table의 id 값을 받아옴 )

Timer Table - task_id ( Foreign Key : Task Table의 id 값을 받아옴 )

Timer Table - start_time : Timer가 시작된 시간

Timer Table - end_time : Timer가 종료된 시

Timer Table - duration : Timer가 가동된 총 시간

</aside>

### 타이머가 정지될 경우

1. stop 버튼을 누른경우
2. 25분이 다 흘러가서 뜬 알림창에서 “종료” 버튼을 누른 경우

모달창으로 결과 리포트가 뜬다. 

## 일반 타이머

- 시작 버튼을 누른다.
- 타이머가 돌아간다.
- 도중에 완료된 업무에 대해서는 완료/미흡 버튼을 누른다.
    - lap 기능으로 해당 업무가 완료된 시점의 시간이 기록된다.
    - 이때 일정 상태 업데이트와 시간의 기록이 이루어진다.
- 정지 버튼을 눌러서 타이머를 종료 시킨다.
    - 업데이트 됐었던 일정에 대한 정보를 받아와서 표시
    - 총 타이머의 시간을 받아서 표시
        - 타이머 테이블에 총 시간이 기록된다.
- 초기화 버튼을 눌렀을 때
    - 시간이 0으로 초기화
    - 각 lap 타임도 0초로 초기화
    

## 타이머 결과 완료 창

- 타이머를 종료시 완료 창

<aside>
💡

사용하는 DB - User Table, Task Table, Timer Table

User Table - id

Task Table - id

Task Table - user_id ( Foreign Key : User Table의 id 값을 받아옴)

Task Table - title : Task의 title

Task Table - description : Task의 description

Task Table - state : Task의 state(상태) → “pending”, “ongoing”, “done”

Timer Table - id

Timer Table - user_id ( Foreign Key : User Table의 id 값을 받아옴)

Timer Table - Task_id ( Foreign Key : Task Table의 id 값을 받아옴)

Timer Table - duration : Timer가 가동된 총 시간

</aside>

### 뽀모도로 타이머

- 뽀모도로 타이머 상태에서 시작 버튼을 누른다.
- 25분 타이머가 클라이언트 측에서 돌아간다.
- 보이지 않게 따로 0초부터 올라가는 시계도 돌아간다.
    - 업무 상태가 바뀌면 경과 시간을 duration에 기록
- 뽀모도로가 감소하여 0초가 된다
- 완료 알림창이 뜬다.
- 확인을 누르면 토마토의 적립 개수가 1 증가한다.
- 5분 타이머가 시작된다.

## 종료

뽀모도로 타이머가 종료될 경우 뜨는 경과 시간은

일반 타이머와 동일하게 총 공부 시간이 뜬다. 

언제 중단하던지 표시되는 시간은 총 공부 시간이다. 

<aside>
💡

사용하는 DB - User Table, Task Table, PomoTimer Table

User Table - id

Task Table - id

Task Table - user_id ( Foreign Key : User Table의 id 값을 받아옴)

Task Table - title : Task의 title

Task Table - description : Task의 description

Task Table - state : Task의 state(상태) → “pending”, “ongoing”, “done”

PomoTimer Table - id

PomoTimer Table - user_id ( Foreign Key : User Table의 id 값을 받아옴)

PomoTimer Table - Task_id ( Foreign Key : Task Table의 id 값을 받아옴)

PomoTimer Table - duration : Timer가 가동된 총 시간

</aside>
