# Local Storage Implementation Guide

## Overview

The CraftLab Opportunities feature now includes local storage fallback functionality, allowing users to post, edit, and delete opportunities even when the database is unavailable. This ensures uninterrupted functionality and data persistence across browser sessions.

## Features Implemented

### 1. Local Storage Helper Functions

Two utility functions manage opportunities in local storage:

```typescript
const LOCAL_OPPORTUNITIES_KEY = 'craftlab_opportunities';

// Retrieve stored opportunities
const getStoredOpportunities = (): Opportunity[] => {
  try {
    const stored = localStorage.getItem(LOCAL_OPPORTUNITIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Store opportunities
const storeOpportunities = (opportunities: Opportunity[]) => {
  try {
    localStorage.setItem(LOCAL_OPPORTUNITIES_KEY, JSON.stringify(opportunities));
  } catch (error) {
    console.error('Error storing opportunities in local storage:', error);
  }
};
```

### 2. Fetch Opportunities with Fallback

The `fetchOpportunities` function now:
- First attempts to fetch from Supabase
- On success, syncs data to local storage for offline capability
- On failure, loads data from local storage
- Sets a flag (`usingLocalStorage`) to indicate offline mode

```typescript
const fetchOpportunities = async () => {
  try {
    // Try Supabase first
    const { data, error } = await supabase.from('opportunities')...

    if (error) throw error;

    setOpportunities(formatted);
    setUsingLocalStorage(false);

    // Sync with local storage
    storeOpportunities(formatted);
  } catch (error) {
    console.log('Supabase unavailable, using local storage');

    // Fallback to local storage
    const localOpportunities = getStoredOpportunities();
    setOpportunities(localOpportunities);
    setUsingLocalStorage(true);
  }
};
```

### 3. Create/Update Opportunities with Fallback

The `handleSubmit` function supports both online and offline modes:

**Create New Opportunity (Offline):**
```typescript
const newOpportunity: Opportunity = {
  id: `local-${Date.now()}`,
  title: formData.title,
  company: formData.company,
  location: formData.location,
  type: formData.type,
  salary: formData.salary,
  description: formData.description,
  deadline: formData.deadline || '',
  createdBy: user.id,
  createdAt: new Date().toISOString(),
  isActive: true,
  requirements: { skills: [], experience: '', education: '' }
};

const updatedOpportunities = [newOpportunity, ...localOpportunities];
storeOpportunities(updatedOpportunities);
```

**Update Existing Opportunity (Offline):**
```typescript
const updatedOpportunities = localOpportunities.map(opp =>
  opp.id === editingId
    ? {
        ...opp,
        title: formData.title,
        company: formData.company,
        // ... other fields
      }
    : opp
);
storeOpportunities(updatedOpportunities);
```

### 4. Delete Opportunities with Fallback

The `handleDelete` function:
- Attempts to delete from Supabase
- Falls back to local storage deletion if database is unavailable

```typescript
catch (error) {
  console.log('Supabase unavailable, deleting from local storage');

  const localOpportunities = getStoredOpportunities();
  const updatedOpportunities = localOpportunities.filter(opp => opp.id !== oppId);
  storeOpportunities(updatedOpportunities);
  setOpportunities(updatedOpportunities);
  setUsingLocalStorage(true);
}
```

### 5. Edit Opportunities with Enhanced Logic

The `handleEdit` function now:
- Checks both Supabase session and local user for ownership
- Works seamlessly in both online and offline modes

### 6. Visual Offline Indicator

When operating in offline mode, users see a clear notification:

```tsx
{usingLocalStorage && (
  <div className="glass bg-blue-500/20 backdrop-blur-lg p-4 rounded-xl border border-blue-500/30 mb-6">
    <div className="flex items-center space-x-3">
      <AlertCircle className="h-5 w-5 text-blue-400" />
      <div>
        <p className="text-blue-300 font-medium">Operating in Offline Mode</p>
        <p className="text-blue-200 text-sm">
          Data is being stored locally. Changes will sync when database connection is restored.
        </p>
      </div>
    </div>
  </div>
)}
```

## How It Works

### Online Mode (Supabase Available)
1. User creates/edits/deletes opportunity
2. Changes are saved to Supabase database
3. Local storage is updated as a backup
4. No offline indicator is shown

### Offline Mode (Supabase Unavailable)
1. User creates/edits/deletes opportunity
2. Changes are saved only to local storage
3. Blue offline indicator banner is displayed
4. Data persists across browser sessions
5. When connection is restored, new data from Supabase will be fetched

### Data Synchronization

The system follows this synchronization strategy:

1. **On Successful Fetch**: Always sync Supabase data to local storage
2. **On Failed Fetch**: Use local storage data as fallback
3. **On Create/Update/Delete**:
   - First try Supabase
   - If fails, update local storage
   - Set offline mode flag

## Local Storage Structure

Opportunities are stored as a JSON array:

```json
[
  {
    "id": "local-1702464000000",
    "title": "Software Development Internship",
    "company": "TechCorp Kenya",
    "location": "Nairobi",
    "type": "internship",
    "salary": "KSh 30,000/month",
    "description": "Learn web development with our team",
    "deadline": "2025-01-31",
    "createdBy": "user-id-123",
    "createdAt": "2024-12-12T10:30:00.000Z",
    "isActive": true,
    "requirements": {
      "skills": [],
      "experience": "",
      "education": ""
    }
  }
]
```

## Browser Compatibility

Local storage is supported by all modern browsers:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)
- Opera 10.5+

## Storage Limits

- Maximum storage: ~5-10MB (varies by browser)
- Suitable for hundreds of opportunities
- Data persists until manually cleared

## User Benefits

1. **Uninterrupted Workflow**: Post opportunities even when offline
2. **Data Persistence**: All changes saved locally
3. **Seamless Experience**: Automatic fallback handling
4. **Clear Feedback**: Visual indicator for offline mode
5. **No Data Loss**: Local storage survives page refreshes

## Developer Notes

### Testing Offline Mode

To test offline functionality:

1. **Disable Network**:
   - Open DevTools (F12)
   - Go to Network tab
   - Set throttling to "Offline"

2. **Simulate Database Failure**:
   - Use invalid Supabase credentials
   - Block Supabase domain in browser

3. **Verify Behavior**:
   - Post new opportunity
   - Edit existing opportunity
   - Delete opportunity
   - Refresh page and verify data persists
   - Check offline indicator appears

### Clearing Local Storage

```javascript
// Clear all CraftLab data
localStorage.removeItem('craftlab_opportunities');

// Or clear everything
localStorage.clear();
```

### Future Enhancements

Potential improvements:

1. **Sync Queue**: Automatically sync local changes when connection is restored
2. **Conflict Resolution**: Handle conflicts between local and remote data
3. **Batch Operations**: Optimize multiple local storage updates
4. **Compression**: Compress stored data for larger datasets
5. **IndexedDB**: Migrate to IndexedDB for larger storage capacity

## Security Considerations

1. **No Sensitive Data**: Don't store passwords or tokens in local storage
2. **User-Specific**: Data is tied to logged-in user
3. **Public Computer Warning**: Remind users to logout on shared computers
4. **XSS Protection**: Validate and sanitize all data before storing

## Troubleshooting

### Issue: Data not persisting
- Check browser's local storage quota
- Verify JavaScript is enabled
- Check for browser extensions blocking storage

### Issue: Offline indicator always showing
- Verify Supabase connection details
- Check network connectivity
- Review browser console for errors

### Issue: Duplicate opportunities
- Clear local storage
- Refresh data from database
- Check for multiple browser tabs

## Conclusion

The local storage implementation provides a robust fallback mechanism for the opportunities feature, ensuring users can always manage opportunities regardless of database availability. The system seamlessly switches between online and offline modes while maintaining data integrity and providing clear user feedback.
