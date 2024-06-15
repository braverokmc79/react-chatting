const users = []; // 사용자 목록을 저장할 배열입니다.

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase(); // 이름의 공백을 제거하고 소문자로 변환합니다.
  room = room.trim().toLowerCase(); // 방 이름의 공백을 제거하고 소문자로 변환합니다.

  const existingUser = users.find((user) => user.room === room && user.name === name); // 같은 방에 같은 이름의 사용자가 있는지 확인합니다.

  if (!name || !room) return { error: 'Username and room are required.' }; // 이름과 방이 없으면 오류를 반환합니다.
  if (existingUser) return { error: 'Username is taken.' }; // 같은 이름의 사용자가 있으면 오류를 반환합니다.

  const user = { id, name, room }; // 새로운 사용자를 생성합니다.

  users.push(user); // 사용자 목록에 추가합니다.

  return { user }; // 사용자 정보를 반환합니다.
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id); // 사용자 목록에서 해당 ID를 가진 사용자의 인덱스를 찾습니다.

  if (index !== -1) return users.splice(index, 1)[0]; // 사용자가 있으면 목록에서 제거하고 반환합니다.
}

const getUser = (id) => users.find((user) => user.id === id); // 해당 ID를 가진 사용자를 반환합니다.

const getUsersInRoom = (room) => users.filter((user) => user.room === room); // 해당 방에 있는 모든 사용자를 반환합니다.

module.exports = { addUser, removeUser, getUser, getUsersInRoom }; // 함수들을 모듈로 내보냅니다.
