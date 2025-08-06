import { useState, useEffect } from 'react';
import { supabase } from '../client'; 
import './Post.css';
import { Link } from 'react-router-dom';

const Post = ({ post, user }) => {
  const [username, setUsername] = useState('');

  const {
    id,
    title,
    content,
    upvote_count = 0,
    advice_category,
    question_category,
    oily_skin_category,
    dry_skin_category,
    combo_skin_category,
    cleansers_category,
    moisturizers_category,
    toners_category,
    sunscreens_category,
    other_category,
    created_at,
    img_or_video 
  } = post;

  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (img_or_video) {
      const { data } = supabase
        .storage
        .from('posts') 
        .getPublicUrl(img_or_video);

      setImageUrl(data.publicUrl);
    }
  }, [img_or_video]);

  const [localUpvotes, setLocalUpvotes] = useState(upvote_count);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchLikedStatus = async () => {
      const { data, error } = await supabase
        .from('post_upvotes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .single();

      if (data) setIsLiked(true);
    };

    if (user) fetchLikedStatus();
  }, [id, user]);

  const tags = [];
  if (advice_category) tags.push('Advice');
  if (question_category) tags.push('Question');
  if (oily_skin_category) tags.push('Oily Skin');
  if (dry_skin_category) tags.push('Dry Skin');
  if (combo_skin_category) tags.push('Combination Skin');
  if (cleansers_category) tags.push('Cleansers');
  if (moisturizers_category) tags.push('Moisturizers');
  if (toners_category) tags.push('Toners');
  if (sunscreens_category) tags.push('Sunscreens');
  if (other_category) tags.push('Other');

  const hoursAgo = created_at
    ? Math.floor((new Date() - new Date(created_at)) / (1000 * 60 * 60))
    : 0;

    const handleLikeToggle = async () => {
        if (!user) {
            alert('You must be logged in to upvote');
            return;
        }

        if (isLiked){
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

    const getTagClass = (tag) => {
    switch (tag) {
        case 'Advice':
        return 'tag-type';
        case 'Question':
        return 'tag-type';
        case 'Oily Skin':
        return 'tag-skintype';
        case 'Dry Skin':
        return 'tag-skintype';
        case 'Combination Skin':
        return 'tag-skintype';
        case 'Cleansers':
        return 'tag-skinproduct';
        case 'Moisturizers':
        return 'tag-skinproduct';
        case 'Toners':
        return 'tag-skinproduct';
        case 'Sunscreens':
        return 'tag-skinproduct';
        case 'Other':
        return 'tag-skinproduct';
        default:
        return 'tag-skinproduct';
    }
    };

    useEffect(() => {
        const fetchUsername = async () => {
            if (!post.user_id) return;
            
            const { data, error } = await supabase
            .from('profiles') // replace with your actual users table
            .select('username') // or whatever the field is called
            .eq('id', post.user_id)
            .single();

            if (data) {
            setUsername(data.username);
            } else {
            console.error('Error fetching username:', error);
            }
        };

        fetchUsername();
    }, [post.user_id]);



  return (
    <div className="post-container">
        <h2 className="feed-timestamp-header">Posted {hoursAgo} hours ago</h2>

        <div className="feed-post-tags">
            {tags.map((tag, index) => (
                <button
                    key={index}
                    className={`user-post-feed-tags ${getTagClass(tag)}`}
                >
                    {tag}
                </button>
            ))}
        </div>

        <div className="feed-post-content">
            <div className="feed-post-left">
            <Link to={`/post/${post.id}`} key={post.id} className="post-link">
                <h1 className="post-feed-header">{title}</h1>
            </Link>
                <p className="post-username-tag">@ {username}</p>
            </div>

            <div className="feed-post-right">
            {imageUrl && (
                <div className="feed-image-container">
                    <img src={img_or_video} className="post-image" alt="Post content" />
                </div>
                )}
            <div className="feed-upvote-div">
                <span
                    onClick={handleLikeToggle}
                    className={`material-symbols-outlined ${isLiked ? 'liked' : ''}`}
                    id="upvote-icon-preview"
                >
                    thumb_up
                </span>
                <p className="feed-upvote-count">{localUpvotes} upvotes</p>
            </div>
            </div>
        </div>
    </div>


  );
};

export default Post;
