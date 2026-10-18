import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Colors from '../../constants/colors';
import Typography from '../../constants/typography';
import Spacing from '../../constants/spacing';
import { useApp } from '../../context/AppContext';

export default function SavedSearchesScreen({ navigation }) {
  const { savedSearches = [], removeSavedSearch, clearSavedSearches } = useApp() || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelect = (keyword) => {
    setSelectedItems((prev) =>
      prev.includes(keyword) ? prev.filter((k) => k !== keyword) : [...prev, keyword]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === savedSearches.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...savedSearches]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;
    Alert.alert(
      'Delete Saved Searches',
      `Are you sure you want to delete ${selectedItems.length} selected search(es)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            selectedItems.forEach((term) => {
              if (typeof removeSavedSearch === 'function') removeSavedSearch(term);
            });
            setSelectedItems([]);
            if (selectedItems.length === savedSearches.length) {
              setIsEditMode(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Saved Searches',
      'Are you sure you want to remove all saved searches?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            if (typeof clearSavedSearches === 'function') clearSavedSearches();
            setSelectedItems([]);
            setIsEditMode(false);
          }
        }
      ]
    );
  };

  const handleSearchItemPress = (keyword) => {
    if (isEditMode) {
      toggleSelect(keyword);
    } else {
      navigation.navigate('Search', { query: keyword });
    }
  };

  const listData = Array.isArray(savedSearches) ? savedSearches : [];

  return (
    <ScreenContainer noPadding style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Saved Searches</Text>

        {listData.length > 0 ? (
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              setIsEditMode(!isEditMode);
              setSelectedItems([]);
            }}>
            <Text style={styles.editBtnText}>{isEditMode ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitleText}>
          Looking for something specific? We'll send you notifications when new items match your keywords.
        </Text>
      </View>

      {/* Edit Mode Actions Bar */}
      {isEditMode && listData.length > 0 && (
        <View style={styles.editBar}>
          <TouchableOpacity style={styles.editBarBtn} onPress={handleSelectAll}>
            <Text style={styles.editBarBtnText}>
              {selectedItems.length === listData.length ? 'Deselect All' : 'Select All'}
            </Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity
              style={[styles.editBarBtn, selectedItems.length === 0 && { opacity: 0.4 }]}
              onPress={handleDeleteSelected}
              disabled={selectedItems.length === 0}>
              <Text style={[styles.editBarBtnText, { color: '#DC2626' }]}>
                Delete ({selectedItems.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBarBtn} onPress={handleDeleteAll}>
              <Text style={[styles.editBarBtnText, { color: '#DC2626' }]}>
                Delete All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSearchItemPress(item)}>
              <View style={styles.itemLeft}>
                {isEditMode ? (
                  <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? Colors.indigo || '#4F46E5' : '#94A3B8'}
                    style={styles.savedIcon}
                  />
                ) : (
                  <Ionicons name="star" size={17} color="#F59E0B" style={styles.savedIcon} />
                )}
                <Text style={styles.itemText}>{item}</Text>
                {!isEditMode && <View style={styles.blueDot} />}
              </View>
              {isEditMode ? (
                <TouchableOpacity
                  onPress={() => {
                    if (typeof removeSavedSearch === 'function') removeSavedSearch(item);
                    setSelectedItems((prev) => prev.filter((k) => k !== item));
                  }}>
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No saved searches yet.</Text>
            <Text style={styles.emptySubtext}>Save searches from the search bar using the star icon.</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF'
  },
  headerBtn: {
    padding: Spacing.xs,
    minWidth: 44
  },
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    color: '#1E293B'
  },
  editBtnText: {
    ...Typography.bodyBold,
    color: '#0A84FF',
    fontSize: 15,
    textAlign: 'right'
  },
  subtitleContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  subtitleText: {
    ...Typography.body,
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18
  },
  editBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  editBarBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  editBarBtnText: {
    ...Typography.captionBold,
    fontSize: 13,
    color: '#0A84FF'
  },
  listContainer: {
    paddingBottom: Spacing.xxl
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  savedIcon: {
    marginRight: Spacing.sm
  },
  itemText: {
    ...Typography.bodyBold,
    fontSize: 16,
    color: '#0F172A'
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A84FF',
    marginLeft: 8
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  emptyText: {
    ...Typography.bodyBold,
    color: '#64748B',
    marginTop: 12,
    fontSize: 16
  },
  emptySubtext: {
    ...Typography.caption,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center'
  }
});
