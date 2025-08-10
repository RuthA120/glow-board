import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../client';
import NavBar from '../components/NavBar';
import './PostProfile.css';

function PostProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [post, setPost] = useState(null);
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const getCategoryType = (cat) => {
    if (cat.includes('skin')) return 'skintype';
    if (cat.includes('cleansers') || cat.includes('moisturizers') || cat.includes('toners') || cat.includes('sunscreens') || cat.includes('other')) return 'producttype';
    if (cat.includes('advice') || cat.includes('question')) return 'type';
    return 'default';
  };

  const getTagsFromPost = (post) => {
    const categories = [
      'advice_category', 'question_category', 'oily_skin_category',
      'dry_skin_category', 'combo_skin_category', 'cleansers_category',
      'moisturizers_category', 'toners_category', 'sunscreens_category',
      'other_category',
    ];

    return categories
      .filter(cat => post[cat])
      .map(cat => {
        let label = cat.replace('_category', '');

        if (label === 'combo_skin') {
          label = 'Combination Skin';
        } else {
          label = label
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

        return {
          label,
          type: getCategoryType(cat),
        };
      });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const { data: authUser } = await supabase.auth.getUser();
      setUser(authUser?.user || null);

      await fetchPost();
      await fetchComments();
    };

    fetchAllData();
  }, [id]);

  const fetchPost = async () => {
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!fk_posts_user_id_profiles(username)
      `)
      .eq('id', id)
      .single();

    if (postError) {
      console.error(postError);
    } else {
      setPost(postData);
      setTags(getTagsFromPost(postData));
      setFile(postData.img_or_video || null);
      setLocalUpvotes(postData.upvote_count || 0);
    }
  };

  const fetchLikedStatus = async (userId) => {
      const { data } = await supabase
        .from('post_upvotes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', userId)
        .single();

      if (data) setIsLiked(true);
  };


  const fetchComments = async () => {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        commenter:profiles!fk_comments_user_id_profiles(username)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    } 
    else {
      setComments(commentsData);
    }
  };


  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: id,
        user_id: user.id,
        content: newComment,
      });

    if (error) {
      console.error('Failed to post comment:', error);
    } else {
      setNewComment('');
      await fetchComments(); 
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      alert('You must be logged in to upvote');
      return;
    }

    if (isLiked) {
      const { error: deleteError } = await supabase
        .from('post_upvotes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', user.id);

      if (!deleteError) {
        const newCount = localUpvotes - 1;
        setIsLiked(false);
        setLocalUpvotes(newCount);

        await supabase
          .from('posts')
          .update({ upvote_count: newCount })
          .eq('id', id);
      }
    } 
    else {
      const { error: insertError } = await supabase
        .from('post_upvotes')
        .insert({ post_id: id, user_id: user.id });

      if (!insertError) {
        const newCount = localUpvotes + 1;
        setIsLiked(true);
        setLocalUpvotes(newCount);

        await supabase
          .from('posts')
          .update({ upvote_count: newCount })
          .eq('id', id);
      }
    }
  };


  const deletePost = async () => {
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;

      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting post:", error);
        alert("Failed to delete post.");
      } 
      else {
        navigate("/feed"); 
      }
    };


  const isPostOwner = user?.id === post?.user_id;

  if (!post) return <div className="loading-div">Loading...</div>;

  return (
    <div className="profile-body-div">
      <NavBar />
      <div id="preview-div">
        <div className="header-div" id="preview-header-div">
          <h1 className="header">Post Details</h1>
        </div>

        <div className="preview-section">
          <div className="preview-top">
            <h3 className="time-header">
              Posted {Math.floor((Date.now() - new Date(post.created_at)) / 3600000)} hours ago
            </h3>

            <div className="preview-tags-div">
              <strong className="preview-tag-header">Tags:</strong>
              <div className="preview-container-tags">
                {tags.map((tag) => (
                  <button key={tag.label} type="button" className={`pill--${tag.type} selected preview-tag`} disabled>
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h1 className="preview-title">{post.title}</h1>
          <div aclassName="post-author-info">
            <p className="post-creator">@ {post.author?.username || 'Unknown'}</p>
          </div>
          <p className="preview-content">{post.content}</p>

          <div className="image-upvote-container">
            <div className="image-container">
              {file && <img src={file} alt="Post content" className="preview-image" />}
            </div>
            <div className="create-preview-bottom">
              <span
                className={`material-symbols-outlined ${isLiked ? 'liked' : ''}`}
                id="upvote-icon-create-preview"
                onClick={handleLikeToggle}
                style={{ cursor: 'pointer' }}
              >
                thumb_up
              </span>
              <p className="upvotes-preview">{localUpvotes} upvotes</p>
            </div>
          </div>

          {isPostOwner && (
            <div className="edit-delete-buttons">
              <button onClick={() => navigate(`/edit/${id}`)} className="edit-button">Edit Post</button>
              <button className="delete-button" onClick={deletePost}>
                Delete Post
              </button>
            </div>
          )}
        </div>

        <div className="comments-section">
          <h2>Comments</h2>
          {Array.isArray(comments) && comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="comment">
                <p><strong>{comment.commenter?.username || 'Anonymous'}:</strong> {comment.content}</p>
                <small>{new Date(comment.created_at).toLocaleString()}</small>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}

          {user ? (
            <div className="add-comment">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment!"
              />
              <button onClick={handleCommentSubmit} className="post-comment">Post Comment</button>
            </div>
          ) : (
            <p>Please log in to comment.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostProfile;