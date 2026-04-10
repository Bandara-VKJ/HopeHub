import { Text, View } from "react-native";
import { homeStyles } from "./homeStyles";
import { Ionicons } from '@expo/vector-icons'

export default function HomeScreen() {


  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.top}>
        <Text style={homeStyles.textOne}> Welcome Vimukthi !</Text>
        <View style={homeStyles.streakBar}>
          <View style={homeStyles.streakContent}>

          <View style={homeStyles.achiveIcon}>
            <Ionicons name="ribbon-outline" size={24} color="#2CA6A4" />
          </View>

          <View style={homeStyles.textContainer}>
            <Text style={homeStyles.streakTitle}>Sobriety Streak</Text>
            <Text style={homeStyles.textTwo}>50 Days!</Text>
          </View>
        </View> 
        </View>
      </View>

      
      <View style={homeStyles.riskContainer}>
        <View style={homeStyles.riskInnerContainer}>
          <View style={homeStyles.iconContainer}>
            <Ionicons name="warning-outline" size={30} color="#f09c00" />
          </View>
          <View style={homeStyles.riskTextContainer}>
            <Text style={homeStyles.riskTitle}>Risk level</Text>
            <Text style={homeStyles.riskPrediction}>moderate Risk</Text>
            <Text style={homeStyles.statement}>Some areas need attention. Review risk factors below.</Text>
          </View>
        </View>
      </View>

      <View style={homeStyles.taskContainer}>
        <Text>Dailt tasks</Text>
      </View>
      <View style={homeStyles.quickActions}>
        <Text>Quick Actions</Text>
      </View>
    </View>
  );
}
