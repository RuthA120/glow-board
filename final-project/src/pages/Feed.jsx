import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../client'; 
import './Feed.css';
import NavBar from '../components/NavBar';
import Post from '../components/Post';

function Feed() {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [user, setUser] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [username, setUsername] = useState('');


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 18;

  const handleOptionSelect = (tab, option) => {
    if (tab === 'Order By') {
      setSelectedOptions(prev => ({ ...prev, [tab]: option }));
    } else {
      setSelectedOptions(prev => {
        const currentSelections = prev[tab] || [];
        const isSelected = currentSelections.includes(option);
        const updatedSelections = isSelected
          ? currentSelections.filter(o => o !== option)
          : [...currentSelections, option];
        return { ...prev, [tab]: updatedSelections };
      });
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setAllPosts(data);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const handleTabClick = (tab) => {
    setActiveDropdown(prev => (prev === tab ? null : tab));
  };

  const getOptionColorClass = (tab) => {
    switch (tab) {
      case 'Order By':
        return 'selected-order';
      case 'Skin Types':
        return 'selected-skin';
      case 'Products':
        return 'selected-products';
      case 'Post Type':
        return 'selected-post';
      default:
        return '';
    }
  };

  const tabOptions = {
    'Order By': ['Newest', 'Most Popular'],
    'Skin Types': ['Oily Skin', 'Dry Skin', 'Combination Skin'],
    'Products': ['Cleansers', 'Moisturizers', 'Toners', 'Sunscreens', 'Other'],
    'Post Type': ['Advice', 'Question']
  };


  const filterPosts = () => {
      return allPosts.filter(post => {
        // Search filter (title or content match)
        if (searchTerm.trim() !== '') {
          const lower = searchTerm.toLowerCase();
          const matches = post.title?.toLowerCase().includes(lower) || post.content?.toLowerCase().includes(lower);
          if (!matches) return false;
        }

        // Filter by Post Type
        if (
          selectedOptions['Post Type'] &&
          selectedOptions['Post Type'].length > 0 &&
          !selectedOptions['Post Type'].some(type =>
            (type === 'Advice' && post.advice_category) ||
            (type === 'Question' && post.question_category)
          )
        ) {
          return false;
        }

        // Filter by Skin Types
        if (
          selectedOptions['Skin Types'] &&
          selectedOptions['Skin Types'].length > 0 &&
          !selectedOptions['Skin Types'].some(type =>
            (type === 'Oily Skin' && post.oily_skin_category) ||
            (type === 'Dry Skin' && post.dry_skin_category) ||
            (type === 'Combination Skin' && post.combo_skin_category)
          )
        ) {
          return false;
        }

        // Filter by Products
        if (
          selectedOptions['Products'] &&
          selectedOptions['Products'].length > 0 &&
          !selectedOptions['Products'].some(product =>
            (product === 'Cleansers' && post.cleansers_category) ||
            (product === 'Moisturizers' && post.moisturizers_category) ||
            (product === 'Toners' && post.toners_category) ||
            (product === 'Sunscreens' && post.sunscreens_category) ||
            (product === 'Other' && post.other_category)
          )
        ) {
          return false;
        }

        return true;
      });
    };


  const filteredPosts = filterPosts();

  // Sorting (Order By)
  if (selectedOptions['Order By'] === 'Most Popular') {
    filteredPosts.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));
  } else {
    // Default: Newest
    filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching auth user:', userError);
        return;
      }

      setUser(user);

      // Now fetch from 'users' table using auth user id
      const { data: userData, error: tableError } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id) 
        .single();

      if (tableError) {
        console.error('Error fetching username:', tableError);
      } else {
        setUsername(userData.username);
      }
    };

    fetchUser();
  }, []);



  return (
    <div className="page-wrapper">
      <div className="feed-body-div">
        <NavBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchContext="posts"
        />
        <div className="feed-tags-div">
          <div className="welcome-user-div">
            <h1 className="welcome-user-header">
              {username ? `Welcome ${username}!` : 'Welcome!'}
            </h1>
            <p className="last-pin-header">Click here to check out more pins!</p>
          </div>

          <div className="dropdown-tabs-row">
            {Object.entries(tabOptions).map(([tab, options], index) => (
              <div className="dropdown-tab" key={index}>
                <button
                  onClick={() => handleTabClick(tab)}
                  className={`tab-button ${activeDropdown === tab ? 'active-tab' : ''}`}
                >
                  {tab} ▾
                </button>
                {activeDropdown === tab && (
                  <div className="dropdown-content">
                    {options.map((option, i) => (
                      <button
                        key={i}
                        className={`dropdown-option ${
                          Array.isArray(selectedOptions[tab])
                            ? selectedOptions[tab].includes(option)
                              ? getOptionColorClass(tab)
                              : ''
                            : selectedOptions[tab] === option
                            ? getOptionColorClass(tab)
                            : ''
                        }`}
                        onClick={() => handleOptionSelect(tab, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="user-posts-div">
            {currentPosts.map(post => (
              <Post key={post.id} post={post} user={user} />
            ))}
          </div>
          <div className="pagination-controls">
            <button onClick={goToPreviousPage} disabled={currentPage === 1}>
              ← Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feed;
