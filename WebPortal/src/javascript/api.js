let userListDemo = require("./patientDemoData.json");
let observationDemo = require("./observationDemoData.json");

const SERVER_URL = "https://senior.fastntech.com/api/users";
const LOGIN_URL = "https://senior.fastntech.com/api/auth/systemLogin";

const moment = require("moment");

export function login(credentials) {
  console.log("Login test");
    fetch(LOGIN_URL, {method:"POST", body:JSON.stringify(credentials)})
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("failed");
        }
      )
}

export default function getUsers() {
  console.log("getUserTest");
    fetch(SERVER_URL)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          console.log("failed");
        }
      )
}

const getUserDemo = () => {
  return combineUsersBundle(userListDemo);
};

const getObservationDemo = () => {
  return combineUsersBundle(observationDemo);
};

function combineUsersBundle(json) {
  let result = [];
  for (let bundle of json) {
    result = result.concat(bundle.entry);
  }
  console.log(result);
  return result;
}

function requestObservation(id) {
  return new Promise((resolve, reject) => {
    fetch(SERVER_URL + "Observation/" + id)
      .then(async res => {
        let json = await res.json();
        console.log(json);
        json = combineUsersBundle(json);
        resolve(json);
      })
      .catch(e => {
        reject(e);
        console.log(e);
      });
  });
}

function requestUserList() {
  return new Promise((resolve, reject) => {
    let localCache = localStorage.getItem("users");
    if (localCache) {
      setTimeout(() => {
        resolve(JSON.parse(localCache));
      }, 1000);
    } else {
      fetch(SERVER_URL + "User/")
        .then(async res => {
          let json = await res.json();
          console.log(json);
          json = combineUsersBundle(json);
          localStorage.setItem("users", JSON.stringify(json));
          resolve(json);
        })
        .catch(e => {
          reject(e);
          console.log(e);
        });
    }
  });
}

function getUserList(message) {
  return new Promise(async resolve => {
    let json = null;
    if (window.$globalUsers) {
      json = window.$globalUsers;
    } else {
      // start load api, show loading
      const hideLoading = message.loading("Please wait, fetching user data...", 0);
      try {
        json = await requestUserList();
        message.success({ content: "User data loaded!", duration: 2 });
      } catch (e) {
        json = getUserDemo();
        // message.warn({
        //   content: "Network Error, the server might be down. Local demo data is loaded.",
        //   duration: 5
        // });
      }
      window.$globalUsers = json;
      hideLoading();
    }
    resolve(json);
  });
}

function parseAllUserData(users) {
  const tableData = [];
  users.forEach(elementRaw => {
    if (!elementRaw) {
      return null;
    }
    let element = elementRaw.resource;
    let user = {};
    user.name = element.name?.[0]?.family + " " + element.name?.[0]?.given?.[0];
    user.id = element.id;
    user.phone = element.telecom?.[0]?.value;
    user.language = element.communication?.[0]?.language?.text;
    user.maritalStatus = element.maritalStatus?.text;
    user.address = element.address?.[0]?.line[0];
    user.city = element.address?.[0]?.city;
    user.state = element.address?.[0]?.state;
    user.country = element.address?.[0]?.country;
    user.gender = element.gender;
    user.birthDate = element.birthDate;
    user.birthMonth = moment(element.birthDate).format("MMMM");
    user.age = moment().diff(element.birthDate, "years");
    user.raw = elementRaw;
    tableData.push(user);
  });

  return tableData;
}

export {
  requestUserList,
  requestObservation,
  getUserDemo,
  getObservationDemo,
  parseAllUserData,
  getUserList,
  getUsers
};
