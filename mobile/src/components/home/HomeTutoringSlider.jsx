import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import Radii from '../../constants/radii';
import Shadows from '../../constants/shadows';

const ORIGINAL_SUBJECTS = [
  { id: '1', name: 'Math', subCategoryName: 'Class 10 Mathematics (1-on-1)', icon: 'calculator-outline' },
  { id: '2', name: 'Science', subCategoryName: 'Physics & Chemistry Mastery', icon: 'flask-outline' },
  { id: '3', name: 'English', subCategoryName: 'Spoken English & Communication', icon: 'book-outline' },
  { id: '4', name: 'Coding', subCategoryName: 'Coding Fundamentals (Python/JS)', icon: 'code-slash-outline' },
  { id: '5', name: 'Music', subCategoryName: 'Spoken English & Communication', icon: 'musical-notes-outline' },
  { id: '6', name: 'Art', subCategoryName: 'Class 10 Mathematics (1-on-1)', icon: 'brush-outline' }
];

const RTL_ORDERED_SUBJECTS = [...ORIGINAL_SUBJECTS].reverse();

export const HomeTutoringSlider = () => {
  const navigation = useNavigation();

  const handleSubjectPress = (item) => {
    navigation.navigate('ServiceBooking', {
      categoryName: 'Home Tutor',
      subCategoryName: item.subCategoryName
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Home Tutoring</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text style={styles.sectionBadge}>1-on-1 Sessions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}>
        {RTL_ORDERED_SUBJECTS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => handleSubjectPress(item)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={item.name}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={22} color={Colors.navy} />
            </View>
            <Text style={styles.subjectName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.tutorSubtitle}>Tutors</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  sectionBadge: {
    ...Typography.captionBold,
    color: Colors.indigo,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.badge,
    fontSize: 11
  },
  scrollContainer: {
    paddingRight: Spacing.xs,
    paddingVertical: 2
  },
  card: {
    width: 96,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.hairline,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    marginRight: Spacing.sm,
    ...Shadows.subtle
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.control,
    backgroundColor: Colors.sunken,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs
  },
  subjectName: {
    ...Typography.bodyBold,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlign: 'center'
  },
  tutorSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 1,
    fontSize: 11
  }
});

export default HomeTutoringSlider;