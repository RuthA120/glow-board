import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreatePost.css'; // Reuse CreatePost styles
import NavBar from '../components/NavBar';
import { supabase } from '../client';

function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTags, setSelectedTags] = useState(new Set());
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [userId, setUserId] = useState(null);

  const tags = [
    { label: 'Advice', type: 'type' },
    { label: 'Question', type: 'type' },
    { label: 'Oily Skin', type: 'skintype' },
    { label: 'Dry Skin', type: 'skintype' },
    { label: 'Combination Skin', type: 'skintype' },
    { label: 'Cleansers', type: 'producttype' },
    { label: 'Moisturizers', type: 'producttype' },
    { label: 'Toners', type: 'producttype' },
    { label: 'Sunscreens', type: 'producttype' },
    { label: 'Other', type: 'producttype' }
  ];

  useEffect(() => {
    const fetchPost = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUserId(authData?.user?.id);

      const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
      if (error) return console.error("Error loading post:", error);

      setTitle(data.title);
      setContent(data.content);
      setImageUrl(data.img_or_video);

      const tagsSet = new Set();
      tags.forEach(tag => {
        const col = tag.label.toLowerCase().replace(/ /g, '_') + '_category';
        if (data[col]) tagsSet.add(tag.label);
      });

      setSelectedTags(tagsSet);
    };

    fetchPost();
  }, [id]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const updated = new Set(prev);
      if (updated.has(tag)) {
        updated.delete(tag);
        return updated;
      }
      if (updated.size >= 5) {
        alert("You can only select up to 5 tags.");
        return prev;
      }
      updated.add(tag);
      return updated;
    });
  };

  function handleChange(e) {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile({
        fileObject: uploadedFile,
        imageUrl: URL.createObjectURL(uploadedFile),
      });
    }
  }

  const updatePost = async (event) => {
    event.preventDefault();

    if (title === '' || content === '') {
      alert("Title and content required.");
      return;
    }

    const tagBooleans = {
      advice_category: selectedTags.has('Advice'),
      question_category: selectedTags.has('Question'),
      oily_skin_category: selectedTags.has('Oily Skin'),
      dry_skin_category: selectedTags.has('Dry Skin'),
      combo_skin_category: selectedTags.has('Combination Skin'),
      cleansers_category: selectedTags.has('Cleansers'),
      moisturizers_category: selectedTags.has('Moisturizers'),
      toners_category: selectedTags.has('Toners'),
      sunscreens_category: selectedTags.has('Sunscreens'),
      other_category: selectedTags.has('Other')
    };

    let uploadedImageUrl = imageUrl;

    if (file?.fileObject) {
      const fileExt = file.fileObject.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `posts-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('posts-images')
        .upload(filePath, file.fileObject);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('posts-images').getPublicUrl(filePath);
      uploadedImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('posts').update({
      title,
      content,
      img_or_video: uploadedImageUrl,
      ...tagBooleans
    }).eq('id', id);

    if (error) {
      console.error("Error updating post:", error);
    } else {
      navigate(`/post/${id}`);
    }
  };

  return (
    <div className="body-div">
      <NavBar />
      {!isVisible ? (
        <form>
          <div className="create-post-container">
            <div className="header-div">
              <h1 className="header">Edit Your Post</h1>
            </div>
            <div className="title-div">
              <h2 className="title-name"><label htmlFor="title">Title:</label></h2>
              <textarea value={title} onChange={(e) => setTitle(e.target.value)} className="title-post" rows="5" maxLength="70" />
            </div>
            <div className="tags-div">
              <h3 className="tags-header">Tags:</h3>
              <div className="container-tags">
                {tags.map(({ label, type }) => (
                  <button
                    key={label}
                    type="button"
                    className={`pill pill--${type} ${selectedTags.has(label) ? 'selected' : ''}`}
                    onClick={() => toggleTag(label)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="content-div">
              <h3 className="content-header">Content:</h3>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="content-area" maxLength="500" rows="10" />
            </div>
            <div className="image-post-div">
              <h3 className="image-header">Upload a new image (optional):</h3>
              <input className="file-upload" type="file" onChange={handleChange} />
            </div>
            <div className="post-buttons-div">
              <button className="submit-button" onClick={updatePost}>Update Post</button>
              <button className="preview-button" type="button" onClick={toggleVisibility}>Preview Changes</button>
            </div>
          </div>
        </form>
      ) : (
        <div id="preview-div">
          <div className="header-div" id="preview-header-div">
            <h1 className="header">Preview Your Post</h1>
          </div>
          <div className="preview-section">
            <div className="preview-top">
              <h3 className="time-header">Posted just now</h3>
              <div className="preview-tags-div">
                <strong className="preview-tag-header">Tags:</strong>
                <div className="preview-container-tags">
                  {[...selectedTags].map(tag => {
                    const tagObj = tags.find(t => t.label === tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`pill pill--${tagObj?.type || 'default'} selected preview-tag`}
                        disabled>
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <h1 className="preview-title">{title}</h1>
            <p className="preview-content">{content}</p>
            <div className="image-upvote-container">
              <div className="image-container">
                {file ? (
                  <img src={file.imageUrl} alt="Preview" className="preview-image" />
                ) : (
                  imageUrl && <img src={imageUrl} alt="Current" className="preview-image" />
                )}
              </div>
              <div className="create-preview-bottom">
                <span class="material-symbols-outlined" id="upvote-icon-create-preview">
                                thumb_up
                            </span>
                <p className="upvotes-preview">0 upvotes</p>
              </div>
            </div>
          </div>
          <div className="preview-post-buttons-div">
            <button className="preview-button" onClick={toggleVisibility}>Back to Edit</button>
            <button className="submit-button" onClick={updatePost}>Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditPost;
