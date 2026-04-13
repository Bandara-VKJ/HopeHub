import { Text, View } from "react-native";
import { homeStyles } from "./homeStyles";
import { Ionicons } from '@expo/vector-icons'
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";

export default function HomeScreen() {

  const [isChecked,setIsChecked] = useState(false)

  const ProgressBar = ({ value, color }) => {
  return (
    <View style={{
      height: 8,
      width: '100%',
      backgroundColor: '#eee',
      borderRadius: 5,
      marginTop: 5,
    }}>
      <View style={{
        width: `${value}%`,
        height: '100%',
        backgroundColor: color,
        borderRadius: 5,
      }} />
    </View>
  );
};

  return (
   <ScrollView style={homeStyles.container}>
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
        <View style={homeStyles.innerTaskContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="checkbox-outline" size={30} color="#17db1a"/>
          <Text style={{ fontWeight: '500', fontSize: 20, marginLeft: 8 }}>
            Daily tasks
          </Text>
          </View>
          <Text style={{  color: '#2CA6A4',}}>2/5 Complete</Text>
        </View>
        <View style={[homeStyles.listContainer,{ backgroundColor: isChecked ? '#2ca6a430' : '#fff' }]}>
          <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
            <Ionicons
              name={isChecked ? "checkbox" : "square-outline"}
              size={24}
              color={isChecked ? "#2CA6A4" : "#999"}
            />
          </TouchableOpacity>
          <Text style={{
            marginLeft: 10,
            textDecorationLine: isChecked ? "line-through" : "none",
            color: isChecked ? "#888" : "#000"
          }}>Morning meditation</Text>
        </View>
      </View>
      <View style={homeStyles.quickActions}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons name="heart" size={30} color="#f60707"/>
          <Text >Risk Factors Analysis</Text>
        </View>
      <View>
          <View style={{ marginBottom: 10 }}>
            <Text>High Stress Levels</Text>
            <ProgressBar value={70} color="#e26d36" />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text>Social Triggers</Text>
            <ProgressBar value={50} color="#f09c00" />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text>Sleep Quality</Text>
            <ProgressBar value={30} color="#2CA6A4" />
          </View>

          <View style={{ marginBottom: 10 }}>
            <Text>Support Network</Text>
            <ProgressBar value={80} color="#17db1a" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
