import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Star, ArrowLeft, Save } from 'lucide-react';
import Select from 'react-select';
import { useCreateFeedback, useUpdateFeedback, useFeedbackById } from '../hooks/useFeedback';
import LoadingSpinner from './LoadingSpinner';

const FeedbackForm = ({ isUpdate = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [tags, setTags] = useState([]);

  const createMutation = useCreateFeedback();
  const updateMutation = useUpdateFeedback();
  const { data: existingFeedback, isLoading: loadingFeedback } = useFeedbackById(isUpdate ? id : null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      customerName: '',
      email: '',
      category: 'General',
      subject: '',
      message: '',
      status: 'Open',
      priority: 'Medium'
    }
  });

  // Category options
  const categoryOptions = [
    { value: 'Product', label: 'Product' },
    { value: 'Service', label: 'Service' },
    { value: 'Support', label: 'Support' },
    { value: 'Website', label: 'Website' },
    { value: 'General', label: 'General' },
    { value: 'Bug Report', label: 'Bug Report' },
    { value: 'Feature Request', label: 'Feature Request' }
  ];

  // Status options
  const statusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Resolved', label: 'Resolved' },
    { value: 'Closed', label: 'Closed' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  // Load existing feedback data for update
  useEffect(() => {
    if (isUpdate && existingFeedback?.data) {
      const feedback = existingFeedback.data;
      
      // Check if feedback can be edited
      const daysDifference = Math.floor((Date.now() - new Date(feedback.createdAt)) / (1000 * 60 * 60 * 24));
      if (daysDifference > 7) {
        navigate('/');
        return;
      }

      reset({
        customerName: feedback.customerName,
        email: feedback.email,
        category: feedback.category,
        subject: feedback.subject,
        message: feedback.message,
        status: feedback.status,
        priority: feedback.priority
      });
      
      setRating(feedback.rating);
      setTags(feedback.tags || []);
    }
  }, [isUpdate, existingFeedback, reset, navigate]);

  // Handle rating click
  const handleRatingClick = (value) => {
    setRating(value);
  };

  // Handle tag input
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim();
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        e.target.value = '';
      }
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Form submission
  const onSubmit = (data) => {
    const formData = {
      ...data,
      rating,
      tags: tags.length > 0 ? tags : undefined
    };

    if (isUpdate) {
      updateMutation.mutate(
        { id, data: formData },
        {
          onSuccess: () => {
            navigate('/');
          }
        }
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          navigate('/');
        }
      });
    }
  };

  // Render star rating
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <Star
          key={index}
          size={32}
          className={`cursor-pointer transition-colors duration-200 ${
            starValue <= (hoveredRating || rating)
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300 hover:text-yellow-200'
          }`}
          onClick={() => handleRatingClick(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      );
    });
  };

  if (isUpdate && loadingFeedback) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to List
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          {isUpdate ? 'Update Feedback' : 'Submit Feedback'}
        </h2>
      </div>

      {/* Edit Restriction Notice for Update */}
      {isUpdate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-yellow-800">
              <strong>Note:</strong> Feedback can only be edited within 7 days of submission.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div className="form-group">
              <label className="form-label">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('customerName', {
                  required: 'Customer name is required',
                  minLength: {
                    value: 2,
                    message: 'Customer name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Customer name cannot exceed 100 characters'
                  }
                })}
                className="input-field"
                placeholder="Enter your full name"
              />
              {errors.customerName && (
                <p className="form-error">{errors.customerName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="input-field"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Details</h3>
          
          <div className="space-y-6">
            {/* Category and Rating */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  value={categoryOptions.find(opt => opt.value === watch('category'))}
                  onChange={(option) => setValue('category', option.value)}
                  options={categoryOptions}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {renderStars()}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 ? `${rating} out of 5 stars` : 'Select rating'}
                  </span>
                </div>
                {rating === 0 && (
                  <p className="form-error">Please select a rating</p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label className="form-label">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('subject', {
                  required: 'Subject is required',
                  minLength: {
                    value: 5,
                    message: 'Subject must be at least 5 characters'
                  },
                  maxLength: {
                    value: 200,
                    message: 'Subject cannot exceed 200 characters'
                  }
                })}
                className="input-field"
                placeholder="Brief description of your feedback"
              />
              {errors.subject && (
                <p className="form-error">{errors.subject.message}</p>
              )}
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('message', {
                  required: 'Message is required',
                  minLength: {
                    value: 10,
                    message: 'Message must be at least 10 characters'
                  },
                  maxLength: {
                    value: 2000,
                    message: 'Message cannot exceed 2000 characters'
                  }
                })}
                className="input-field min-h-[120px]"
                placeholder="Detailed description of your feedback"
                rows={6}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.message && (
                  <p className="form-error">{errors.message.message}</p>
                )}
                <span className="text-sm text-gray-500">
                  {watch('message')?.length || 0} / 2000 characters
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Press Enter to add tags (max 10)"
                onKeyDown={handleTagInput}
                disabled={tags.length >= 10}
              />
              <p className="text-sm text-gray-600 mt-1">
                Add relevant tags to categorize your feedback
              </p>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-green-600"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-green-600 hover:text-green-800
"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Status and Priority (for updates) */}
            {isUpdate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <Select
                    value={statusOptions.find(opt => opt.value === watch('status'))}
                    onChange={(option) => setValue('status', option.value)}
                    options={statusOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <Select
                    value={priorityOptions.find(opt => opt.value === watch('priority'))}
                    onChange={(option) => setValue('priority', option.value)}
                    options={priorityOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link to="/" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={
              rating === 0 || 
              (isUpdate ? updateMutation.isLoading : createMutation.isLoading)
            }
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isUpdate 
              ? (updateMutation.isLoading ? 'Updating...' : 'Update Feedback')
              : (createMutation.isLoading ? 'Submitting...' : 'Submit Feedback')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
