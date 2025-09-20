# 📚 FarmNex Training Materials - File Structure Documentation

## 🏗️ **Overall Architecture**

FarmNex uses a comprehensive training system with file uploads, content management, and user interaction capabilities. The structure supports various content types including videos, PDFs, guides, and interactive materials.

---

## 📁 **Backend Structure**

### **Core Files**
```
backend/
├── models/
│   └── TrainingMaterial.js          # MongoDB schema definition
├── controllers/
│   └── trainingController.js        # Business logic and API handlers
├── routers/
│   └── trainingRoutes.js           # API endpoint definitions
└── uploads/                        # File storage directory
    ├── *.mp4                       # Video files
    ├── *.pdf                       # Document files
    ├── *.jpg                       # Image files
    └── [other supported files]
```

### **📋 TrainingMaterial Model Schema**
```javascript
{
  title: String (required, max 200 chars)
  description: String (required, max 1000 chars)
  type: Enum ['Video', 'Guide', 'Article', 'PDF', 'FAQ']
  uploadLink: String (optional)
  fileName: String (generated automatically)
  fileSize: Number (bytes)
  content: String (max 10000 chars for text content)
  tags: Array of Strings
  difficulty: Enum ['Beginner', 'Intermediate', 'Advanced']
  category: Enum ['Crop Management', 'Livestock', 'Equipment', 'Finance', 'Marketing', 'General']
  views: Number (default 0, auto-incremented)
  status: Enum ['draft', 'published', 'archived']
  isActive: Boolean (for soft delete)
  createdBy: String (creator name)
  createdByRole: Enum ['admin', 'farmer', 'user']
  timestamps: { createdAt, updatedAt }
}
```

### **🎯 Supported File Types**
```
Images:     .jpeg, .jpg, .png, .gif, .webp, .svg
Documents:  .pdf, .doc, .docx, .txt
Videos:     .mp4, .avi, .mov, .wmv, .webm, .mkv
Audio:      .mp3, .wav, .m4a, .ogg, .flac
Archives:   .zip, .rar, .7z
Office:     .xls, .xlsx, .ppt, .pptx
```

### **📊 File Upload Limits**
- **Maximum file size**: 500MB
- **Maximum files per upload**: 1
- **Field data limit**: 25MB
- **Maximum form fields**: 20

---

## 🖥️ **Frontend Structure**

### **Main Directory Structure**
```
frontend/src/components/training/
├── pages/                          # Main training pages
│   ├── TrainingHomePage.jsx        # Landing page for training section
│   ├── TrainingShowcase.jsx        # Featured training materials
│   ├── AddEditTraining.jsx         # Create/edit training materials
│   ├── ViewTraining.jsx            # View individual training material
│   └── PublicTrainingViewer.jsx    # Public viewer (no auth required)
│
├── components/                     # Reusable UI components
│   ├── TrainingCard.jsx            # Material preview card
│   ├── TrainingViewer.jsx          # Content display component
│   ├── TrainingCategories.jsx      # Category filter component
│   ├── TrainingNavSection.jsx      # Navigation component
│   ├── AddEditTrainingForm.jsx     # Form for creating/editing
│   ├── PublishedTrainingSection.jsx # Public training showcase
│   └── EnhancedVideoPlayer.jsx     # Custom video player
│
├── management/                     # Admin management components
│   └── TrainingManagement.jsx      # Admin dashboard for training
│
├── utils/                         # Utility components
│   ├── TrainingProgress.jsx        # Progress tracking
│   ├── TrainingReport.jsx          # Analytics and reporting
│   ├── TrainingQuickAccess.jsx     # Quick access shortcuts
│   └── TrainingIntegration.jsx     # Integration helpers
│
├── [REMOVED] legacy/               # Legacy components moved to training_backup/
│
└── index.js                       # Main export file
```

### **🔧 Services & APIs**
```
frontend/src/services/
├── trainingAPI.js                 # API service layer
└── trainingAPIReal.js            # Real API implementation
```

### **🎨 Styling**
```
frontend/src/styles/
└── training.css                  # Training-specific styles
```

---

## 🔄 **API Endpoints**

### **Training Material Routes**
```
GET    /api/training                    # Get all materials (with filtering)
GET    /api/training/:id               # Get specific material by ID
POST   /api/training                   # Create new material (with file upload)
PUT    /api/training/:id               # Update existing material
DELETE /api/training/:id               # Soft delete material

GET    /api/training/statistics        # Get analytics data
GET    /api/training/export/excel      # Export data to Excel
GET    /api/training/export/pdf        # Export data to PDF
GET    /api/training/published         # Get only published materials (public)
```

### **Query Parameters**
```javascript
// GET /api/training
{
  page: Number,           // Pagination page (default: 1)
  limit: Number,          // Items per page (default: 10)
  type: String,           // Filter by type ('Video', 'PDF', etc.)
  category: String,       // Filter by category
  search: String,         // Text search across title, description, tags
  status: String          // Filter by status ('published', 'draft', 'archived')
}
```

---

## 💾 **File Storage System**

### **Upload Directory Structure**
```
backend/uploads/
├── file-[timestamp]-[random].mp4     # Video files
├── file-[timestamp]-[random].pdf     # PDF documents
├── file-[timestamp]-[random].jpg     # Image files
└── file-[timestamp]-[random].[ext]   # Other supported files
```

### **File Naming Convention**
- **Pattern**: `file-[timestamp]-[randomNumber].[extension]`
- **Timestamp**: Unix timestamp in milliseconds
- **Random Number**: 9-digit random number
- **Example**: `file-1758345148149-549921373.jpg`

### **Current Storage (Example)**
```
📁 uploads/ (36 files, ~40MB total)
├── 🎥 1 video file (35.6MB MP4)
├── 📄 4 PDF files (2.5MB total)
└── 🖼️ 31 image files (~3.7MB total)
```

---

## 🚀 **Key Features**

### **Content Management**
- ✅ Multiple content types support
- ✅ Rich text content with file attachments
- ✅ Categorization and tagging system
- ✅ Difficulty level classification
- ✅ Draft/Published workflow
- ✅ View tracking and analytics

### **File Handling**
- ✅ Secure file upload with validation
- ✅ Large file support (up to 500MB)
- ✅ Multiple format support
- ✅ Automatic file naming and storage
- ✅ File size and type restrictions

### **User Experience**
- ✅ Public and authenticated access
- ✅ Search and filtering capabilities
- ✅ Responsive design
- ✅ Progress tracking
- ✅ Interactive components

### **Admin Features**
- ✅ Content management dashboard
- ✅ Analytics and reporting
- ✅ Export capabilities (Excel, PDF)
- ✅ Bulk operations
- ✅ User role management

---

## 🔐 **Security & Permissions**

### **File Upload Security**
- File type validation (whitelist approach)
- File size limits
- MIME type verification
- Secure file naming (prevents path traversal)
- Upload directory isolation

### **Access Control**
- Public endpoint for published materials
- Authentication required for management
- Role-based permissions (admin, farmer, user)
- Soft delete for data integrity

---

## 📈 **Usage Statistics**

### **Current Content**
- **Total Files**: 36 uploaded files
- **Video Content**: 1 large video file (35.6MB)
- **Documents**: 4 PDF files for guides/manuals
- **Images**: 31 supporting images for materials

### **Performance Considerations**
- Large file support with streaming capabilities
- Efficient querying with MongoDB indexing
- Pagination for large datasets
- Caching strategies for frequently accessed content

---

## 🛠️ **Integration Points**

### **Homepage Integration**
- Featured training materials showcase
- Quick access to popular content
- Category-based navigation

### **Chatbot Integration**
- Training material recommendations
- Context-aware content suggestions
- Voice/text-based content search

### **User Dashboard**
- Progress tracking
- Personalized recommendations
- Bookmark functionality

---

This structure provides a comprehensive, scalable training system suitable for agricultural education and resource sharing in the FarmNex ecosystem.