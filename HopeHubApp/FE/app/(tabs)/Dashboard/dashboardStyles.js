import { StyleSheet } from 'react-native';

export const dashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef6f6',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'gray',
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  riskText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  metricBtn: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 10,
  },
  activeBtn: {
    backgroundColor: 'teal',
  },
  btnText: {
    color: '#000',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 200,
    alignItems: 'flex-end',
    margin: 10,
  },
  barContainer: {
    alignItems: 'center',
  },
  bar: {
    width: 20,
    backgroundColor: 'teal',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
  },
});