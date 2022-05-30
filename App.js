import { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Button, Text, TextInput, View, Platform, Image, Linking  } from 'react-native';
import * as SQLite from 'expo-sqlite';
import styles from './Style';
import axios from 'axios';

const db = SQLite.openDatabase('db.db');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {

  const [user, setUser] = useState({login_id:0});
  const [loginId, setLoginId] = useState(0);
  const [alerts, setAlerts] = useState([]);

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const createTable = async () => {
    db.transaction(tx => {
      tx.executeSql(
        "create table if not exists user (id integer primary key not null, login_id int);"
      );
    });
  }

  const searchUser = async () => {
    db.transaction(tx => {
      tx.executeSql(
        "select * from user",
        [],
        (tx, resp) => {
          if (resp.rows.length > 0) {
            for (let i = 0; i < resp.rows.length; ++i) {
              setUser(resp.rows.item(i));
            }
          }
        }
      );
    });
  }

  const insertUser = async () => {
    db.transaction(function (tx) {
      tx.executeSql(
        'INSERT INTO user (login_id) VALUES (?)',
        [loginId],
        (tx, results) => {
          console.log('Results', results.rowsAffected);
          if (results.rowsAffected > 0) {
            searchUser();
            Alert.alert(
              'Successo',
              'Hai registrato correttamente il codice'
            );
          } else alert('Si è verificato un errore durante la registrazione del codice');
        }
      );
    });
  }

  const getAlerts = () => {
    let data = new FormData();
    data.append('login_id', user.login_id);
    
    axios({
      method: "post",
      url: 'https://app.nonsolograndine.it/test/system/notifiche/ajax/alerts.php',
      data: data,
      headers: { "Content-Type": "multipart/form-data" },
    }).then((resp) => {
      // console.log(resp.data);
      setAlerts(resp.data);
    })
    // fetch('https://app.nonsolograndine.it/test/system/notifiche/ajax/alerts.php', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': '*/*',
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: formData
    // }).then((resp) => {
    //   console.log(resp.data);
    // }).catch((resp) => {
    //   console.log(resp, 'teste');
    // });
  }

  useEffect(() => {
    Promise.all(
      createTable(),
      searchUser(),
      getAlerts()
    ).catch((error) => {
      console.log(error);
    });
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    let data = new FormData();
    data.append('login_id', user.login_id);
    data.append('token', expoPushToken);

    axios({
      method: "post",
      url: 'https://app.nonsolograndine.it/test/system/notifiche/ajax/token.php',
      data: data,
      headers: { "Content-Type": "multipart/form-data" },
    }).then((resp) => {
      console.log(resp.data);
    });
  }, [expoPushToken]);

  const uri = 'https://app.nonsolograndine.it/test/dashboard.php?exe=notifiche/index';

  return (
    <View style={styles.container}>
      {
        user.login_id === 0 ?
          <View style={styles.container}>
            <Image
              style={styles.stretch}
              source={require('./assets/logo.png')}
            />
            <Text style={styles.inputTitle}>Inserisci il codice fornito nel tuo account sull'APP Web</Text>
            <TextInput
              style={styles.input}
              label={'Codice'}
              placeholder={'Digita il codice'}
              onChangeText={text => setLoginId(text)}
            />
            <Button title='Salvare' onPress={insertUser} />
          </View>
        :
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <Image
              style={styles.stretch}
              source={require('./assets/logo.png')}
            />
            {
              alerts.length > 0 ?
                <>
                  <Text style={styles.title}>Hai {alerts.length} notifiche sul tuo account</Text>
                  <Button onClick={() => { Linking.openURL(uri); }} title="Vedi notifiche"></Button>
                </>
              :
                <Text style={styles.title}>Non hai notifiche</Text>
            }
          </View>
      }
      <StatusBar style="auto" />
    </View>
  );
}

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  }).then((resp) => {
    console.log(resp);
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}