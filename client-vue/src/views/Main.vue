<template>
  <div class="main-container">
    <div class="room-list-container">
      <button @click="onClickConnect" class="btn-connect">접속</button>
      <label for="nameer">Name</label>
      <input
        name="nameer"
        type="text"
        class="name-input"
        :disabled="userNameSetted"
        v-model="userName"
      />
      <select v-model="currentRoom" size="6" class="room-list">
        <option v-for="room in roomList" :value="room" :key="room">
          {{ room }}
        </option>
      </select>

      <div class="create-chat-room">
        <div>채팅방 만들기</div>
        <input v-model="newChatRoomName" type="text" />
        <button @click="addChatRoom">Create</button>
      </div>

      <div class="test-area">
        <button class="test1" @click="sample1">Test1</button>
      </div>
    </div>
    <div class="chat-container">
      <div class="current-room">현재 채팅방: {{ currentRoomName }}</div>
      <div class="chats-wrap">
        <div class="chats">
          <div
            class="chat-item"
            :class="{ me: message.userName === userName }"
            v-for="message in (messages && messages.roomMessages) || []"
            :key="message"
          >
            <div>{{ message.userName }}:</div>
            <div>{{ message.message }}</div>
          </div>
          <!-- <div class="chat-item">
            <div>bwpark:</div>
            <div>hello</div>
          </div> -->
        </div>
        <div class="chat-input">
          <textarea
            v-model="myChatText"
            name="chat-input"
            id=""
            cols="50"
            rows="10"
            :disabled="!connected"
          ></textarea>
          <button
            :disabled="!connected"
            @click="onClickSendButton"
            class="btn-send"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import io from "socket.io-client";
import axios, { AxiosResponse } from "axios";

type userList = string[];
type roomListType = string[];
type roomMessageList = {
  room: string;
  roomMessages: {
    userName: string;
    message: string;
  }[];
};
type ParamType = {
  userName: string;
  message: string;
};

export default defineComponent({
  name: "Main",
  components: {},
  setup() {
    console.log("setup");

    // Datas
    const counter = ref(0);
    const userName = ref("");
    const userNameSetted = ref(false);
    const soc = ref<io.Socket | null>(null);
    const messages = ref<roomMessageList | null>(null);
    const roomList = ref<roomListType>([]);
    const myChatText = ref("");
    const newChatRoomName = ref("");
    const currentRoom = ref("room 2");
    const currentRoomName = ref("");
    const connected = ref(false);

    // Functions
    function onChangeroomList() {
      console.log("onChangeroomList");
    }
    async function getRoomList() {
      const { data }: AxiosResponse = await axios.get(
        "http://localhost:8999/room"
      );
      console.log("data? ", data);
      roomList.value = data.result;
    }
    async function getRoom() {
      console.log("getRoom");
      const roomId = "room 2";
      const { data }: AxiosResponse = await axios.get(
        "http://localhost:8999/room/" + roomId
      );
      console.log(data);
      messages.value = data.result;
      currentRoomName.value = data.result.room;
    }
    function socketConnection() {
      soc.value = io.io("ws://localhost:8999/");
      connected.value = true;
    }
    function addSocketListener() {
      if (soc.value === null) return;

      soc.value.on("chat message", (param: ParamType) => {
        console.log("listen ", param);
        const { userName, message } = param;

        if (messages.value === null) return;

        messages.value.roomMessages.push({
          userName,
          message,
        });
      });

      soc.value.on("room created", (roomId: string) => {
        console.log("room created ", roomId);
        roomList.value.push(roomId);
      });
    }
    function onClickConnect() {
      console.log("onClickConnect");
      if (userName.value === "") return;

      userNameSetted.value = true;
      socketConnection();
      addSocketListener();
    }
    function onClickSendButton() {
      console.log("onClickSendButton");
      if (soc.value === null) return;
      if (myChatText.value === "") return;

      soc.value.emit("chat message", {
        userName: userName.value,
        message: myChatText.value,
      });
    }
    async function addChatRoom() {
      if (newChatRoomName.value === "") return;
      await axios.post("http://localhost:8999/room", {
        roomId: newChatRoomName.value,
      });
    }
    async function sample1() {
      console.log("sample1");
      const mSoc = io.io("ws://localhost:8999/roro");
      mSoc.emit("chat", "hi");
    }

    // LifeCycles
    onMounted(() => {
      console.log("mounted");
      getRoomList();
      getRoom();
      // socketConnection();
      // addSocketListener();
    });

    return {
      // data
      counter,
      userName,
      userNameSetted,
      roomList,
      messages,
      myChatText,
      currentRoom,
      newChatRoomName,
      currentRoomName,
      connected,

      // methods
      onClickConnect,
      onChangeroomList,
      onClickSendButton,
      addChatRoom,
      sample1,
    };
  },
});
</script>
<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.main-container {
  padding: 100px;
  display: flex;
  justify-content: space-around;
  max-width: 1200px;
  margin: 0 auto;

  .room-list-container {
    display: flex;
    flex-direction: column;

    .btn-connect {
      margin-bottom: 30px;
      width: 150px;
    }

    .name-input {
      margin-bottom: 30px;
    }
    .room-list {
      margin-bottom: 30px;
    }
  }

  .chat-container {
    flex: 1;
    margin-left: 50px;
    max-width: 500px;

    .current-room {
      margin-bottom: 30px;
    }

    .chats-wrap {
      .chats {
        height: 400px;
        background: rgba(0, 50, 0, 0.3);
        overflow: scroll;
        padding: 30px;
        .chat-item {
          margin-bottom: 10px;

          &.me {
            text-align: right;
          }
        }
      }

      .chat-input {
        display: flex;

        textarea {
          font-size: 16px;
          resize: none;
        }
        .btn-send {
          flex: 1;
        }
      }
    }
  }
}
</style>