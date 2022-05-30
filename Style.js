import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'grey'
  },
  inputTitle: {
    fontSize: 16
  },
  title: {
    fontSize: 20,
    color: "#BD1828",
    marginTop: 20,
    marginBottom: 20
  },  
  input: {
    height: 80,
    textAlign: "center",
    fontSize: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    borderRadius: 8,
    width: "100%"
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  stretch: {
    width: 200,
    height: 200,
    resizeMode: 'stretch'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderError: {
    borderWidth: 1,
    borderColor: 'rgba(200,0,50,1)'
  },
  errorMessage: {
    fontSize: 12,
    color: 'rgba(200,0,50,1)',
    textAlign: 'center',
    marginTop: 5
  },
  button: {
    borderRadius: 10,
    marginTop: 20
  },
})

export default styles