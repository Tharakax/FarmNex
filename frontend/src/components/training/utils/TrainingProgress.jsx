import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  TrendingUp,
  Calendar,
  Target,
  Star,
  BarChart3,
  Trophy,
  Medal,
  Bookmark,
  Eye,
  Video,
  FileText
} from 'lucide-react';

// Card component
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

// Progress Card Component
const ProgressCard = ({ title, current, total, color = "blue", icon: Icon }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600"
  };

  const progressColors = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    orange: "bg-orange-600",
    purple: "bg-purple-600"
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <span className="text-sm text-gray-500">{percentage}%</span>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
          <span>{current} of {total}</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${progressColors[color]} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

// Material Progress Item Component
const MaterialProgressItem = ({ material, progress, onViewMaterial }) => {
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4 text-red-600" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'bookmarked':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onViewMaterial && onViewMaterial(material)}
    >
      <div className="flex-shrink-0">
        {getTypeIcon(material.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {material.title}
        </h4>
        <p className="text-xs text-gray-500">
          {material.category} • {material.difficulty}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        {progress.status === 'completed' && (
          <CheckCircle className="h-5 w-5 text-green-600" />
        )}
        
        <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(progress.status)}`}>
          {progress.status === 'completed' ? 'Completed' : 
           progress.status === 'in-progress' ? 'In Progress' : 
           progress.status === 'bookmarked' ? 'Bookmarked' : 'Not Started'}
        </span>

        {progress.completedAt && (
          <span className="text-xs text-gray-500">
            {new Date(progress.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ achievement, earned = false }) => {
  return (
    <div className={`p-4 rounded-lg border-2 text-center transition-all ${
      earned 
        ? 'border-yellow-300 bg-yellow-50' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      <div className={`text-3xl mb-2 ${earned ? 'text-yellow-600' : 'text-gray-400'}`}>
        {achievement.icon}
      </div>
      <h4 className={`text-sm font-medium mb-1 ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
        {achievement.name}
      </h4>
      <p className={`text-xs ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
        {achievement.description}
      </p>
      {earned && achievement.earnedDate && (
        <p className="text-xs text-yellow-600 mt-1">
          Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const TrainingProgress = ({ onViewMaterial }) => {
  const [progressData, setProgressData] = useState({
    overall: { completed: 0, total: 0 },
    byCategory: {},
    recentActivity: [],
    achievements: [],
    bookmarked: [],
    inProgress: []
  });

  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    // Load exact progress data
    const mockProgressData = {
      overall: { completed: 15, total: 47 }, // Exact numbers
      byCategory: {
        'Crop Management': { completed: 8, total: 16 },
        'Livestock': { completed: 4, total: 13 },
        'Equipment': { completed: 2, total: 9 },
        'Finance': { completed: 1, total: 6 },
        'Marketing': { completed: 0, total: 3 },
        'General': { completed: 0, total: 0 }
      },
      recentActivity: [
        {
          id: '1',
          title: 'Soil pH Testing Guide',
          type: 'Video',
          category: 'Crop Management',
          difficulty: 'Beginner',
          status: 'completed',
          completedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '2',
          title: 'Organic Pest Control',
          type: 'PDF',
          category: 'Crop Management',
          difficulty: 'Intermediate',
          status: 'in-progress',
          lastAccessed: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '3',
          title: 'Livestock Nutrition Basics',
          type: 'Article',
          category: 'Livestock',
          difficulty: 'Beginner',
          status: 'bookmarked',
          bookmarkedAt: new Date(Date.now() - 259200000).toISOString()
        }
      ],
      achievements: [
        {
          id: 'first-complete',
          name: 'First Steps',
          description: 'Complete your first training material',
          icon: '🎯',
          earned: true,
          earnedDate: new Date(Date.now() - 604800000).toISOString()
        },
        {
          id: 'crop-expert',
          name: 'Crop Expert',
          description: 'Complete 5 crop management materials',
          icon: '🌱',
          earned: true,
          earnedDate: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: 'dedicated-learner',
          name: 'Dedicated Learner',
          description: 'Complete 10 training materials',
          icon: '📚',
          earned: true,
          earnedDate: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'well-rounded',
          name: 'Well Rounded',
          description: 'Complete materials from all categories',
          icon: '🏆',
          earned: false
        },
        {
          id: 'master-farmer',
          name: 'Master Farmer',
          description: 'Complete 25 training materials',
          icon: '👑',
          earned: false
        },
        {
          id: 'knowledge-seeker',
          name: 'Knowledge Seeker',
          description: 'Complete 50 training materials',
          icon: '🎓',
          earned: false
        }
      ],
      bookmarked: [
        {
          id: '1',
          title: 'Advanced Irrigation Systems',
          type: 'Video',
          category: 'Equipment',
          difficulty: 'Advanced'
        },
        {
          id: '2',
          title: 'Market Price Analysis',
          type: 'Article',
          category: 'Marketing',
          difficulty: 'Intermediate'
        }
      ],
      inProgress: [
        {
          id: '1',
          title: 'Organic Pest Control',
          type: 'PDF',
          category: 'Crop Management',
          difficulty: 'Intermediate',
          progress: 60
        },
        {
          id: '2',
          title: 'Financial Planning Guide',
          type: 'Guide',
          category: 'Finance',
          difficulty: 'Advanced',
          progress: 30
        }
      ]
    };

    setProgressData(mockProgressData);
  }, []);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'achievements', name: 'Achievements', icon: Trophy },
    { id: 'activity', name: 'Recent Activity', icon: Clock },
    { id: 'bookmarks', name: 'Bookmarked', icon: Bookmark }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Overall Progress</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Training Materials Completed</span>
              <span className="text-2xl font-bold text-gray-900">
                {progressData.overall.completed}/{progressData.overall.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 bg-green-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${progressData.overall.total > 0 ? 
                    (progressData.overall.completed / progressData.overall.total) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              {progressData.overall.total > 0 ? 
                Math.round((progressData.overall.completed / progressData.overall.total) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
      </Card>

      {/* Progress by Category */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(progressData.byCategory).map(([category, data]) => (
            <ProgressCard
              key={category}
              title={category}
              current={data.completed}
              total={data.total}
              color={category === 'Crop Management' ? 'green' : 
                     category === 'Livestock' ? 'orange' : 
                     category === 'Equipment' ? 'blue' : 'purple'}
              icon={category === 'Crop Management' ? Award : 
                    category === 'Livestock' ? Target : 
                    category === 'Equipment' ? BookOpen : Star}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{progressData.overall.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </Card>
        
        <Card className="text-center">
          <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{progressData.inProgress.length}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </Card>
        
        <Card className="text-center">
          <Bookmark className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{progressData.bookmarked.length}</div>
          <div className="text-sm text-gray-500">Bookmarked</div>
        </Card>
        
        <Card className="text-center">
          <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {progressData.achievements.filter(a => a.earned).length}
          </div>
          <div className="text-sm text-gray-500">Achievements</div>
        </Card>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progressData.achievements.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              earned={achievement.earned}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {progressData.recentActivity.map((material) => (
            <MaterialProgressItem
              key={material.id}
              material={material}
              progress={{ 
                status: material.status,
                completedAt: material.completedAt,
                lastAccessed: material.lastAccessed
              }}
              onViewMaterial={onViewMaterial}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderBookmarks = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookmarked Materials</h3>
        {progressData.bookmarked.length > 0 ? (
          <div className="space-y-3">
            {progressData.bookmarked.map((material) => (
              <MaterialProgressItem
                key={material.id}
                material={material}
                progress={{ status: 'bookmarked' }}
                onViewMaterial={onViewMaterial}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h4>
            <p className="text-gray-500">Bookmark training materials to access them quickly later.</p>
          </Card>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'achievements':
        return renderAchievements();
      case 'activity':
        return renderActivity();
      case 'bookmarks':
        return renderBookmarks();
      case 'overview':
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Learning Progress</h2>
        <p className="text-gray-600">Track your training progress and achievements</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
};

export default TrainingProgress;
