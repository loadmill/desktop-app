import { ProxyEntry } from '../../types/proxy-entry';

export const dummyEntries: ProxyEntry[] = [
  {
    id: '1',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://www.google.com',
    },
    response: {
      body: {
        mimeType: 'text/html',
        text: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <title>Ĥhhhh</title>
    <meta name="description" content="A blog about thoughts, stories and ideas." />

    <meta name="HandheldFriendly" content="True" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="shortcut icon" href="/favicon.ico">

    <link rel="stylesheet" type="text/css" href="/assets/css/screen.css?v=995dffd1a6" />
    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Merriweather:300,700,700italic,300italic|Open+Sans:700,400" />

    <link rel="canonical" href="https://loadmill-test-blog.herokuapp.com/" />
    <meta name="referrer" content="no-referrer-when-downgrade" />
    <link rel="next" href="https://loadmill-test-blog.herokuapp.com/page/2/" />
    
    <meta property="og:site_name" content="Ĥhhhh" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Ĥhhhh" />
    <meta property="og:description" content="A blog about thoughts, stories and ideas." />
    <meta property="og:url" content="https://loadmill-test-blog.herokuapp.com/" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="Ĥhhhh" />
    <meta name="twitter:description" content="A blog about thoughts, stories and ideas." />
    <meta name="twitter:url" content="https://loadmill-test-blog.herokuapp.com/" />
    
    <script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Website",
    "publisher": {
        "@type": "Organization",
        "name": "Ĥhhhh",
        "logo": "https://loadmill-test-blog.herokuapp.com/ghost/img/ghosticon.jpg"
    },
    "url": "https://loadmill-test-blog.herokuapp.com/",
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://loadmill-test-blog.herokuapp.com"
    },
    "description": "A blog about thoughts, stories and ideas."
}
    </script>

    <meta name="generator" content="Ghost 0.11" />
    <link rel="alternate" type="application/rss+xml" title="Ĥhhhh" href="https://loadmill-test-blog.herokuapp.com/rss/" />
</head>
<body class="home-template nav-closed">

    <div class="nav">
    <h3 class="nav-title">Menu</h3>
    <a href="#" class="nav-close">
        <span class="hidden">Close</span>
    </a>
    <ul>
            <li class="nav-home nav-current" role="presentation"><a href="https://loadmill-test-blog.herokuapp.com/">Home</a></li>
    </ul>
        <a class="subscribe-button icon-feed" href="https://loadmill-test-blog.herokuapp.com/rss/">Subscribe</a>
</div>
<span class="nav-cover"></span>


    <div class="site-wrapper">

        
<header class="main-header no-cover">
    <nav class="main-nav overlay clearfix">
        
            <a class="menu-button icon-menu" href="#"><span class="word">Menu</span></a>
    </nav>
    <div class="vertical">
        <div class="main-header-content inner">
            <h1 class="page-title">Ĥhhhh</h1>
            <h2 class="page-description">A blog about thoughts, stories and ideas.</h2>
        </div>
    </div>
    <a class="scroll-down icon-arrow-left" href="#content" data-offset="-45"><span class="hidden">Scroll Down</span></a>
</header>

<main id="content" class="content" role="main">

    <div class="extra-pagination inner">
    <nav class="pagination" role="navigation">
    <span class="page-number">Page 1 of 1054</span>
        <a class="older-posts" href="/page/2/">Older Posts <span aria-hidden="true">&rarr;</span></a>
</nav>

</div>

<article class="post">
    <header class="post-header">
        <h2 class="post-title"><a href="/testim-io-1234-299/">Testim.io 1234</a></h2>
    </header>
    <section class="post-excerpt">
        <p>Bla 456 <a class="read-more" href="/testim-io-1234-299/">&raquo;</a></p>
    </section>
    <footer class="post-meta">
        
        <a href="/author/jon/">Jon Skeet</a>
        
        <time class="post-date" datetime="2023-01-17">17 January 2023</time>
    </footer>
</article>
<article class="post">
    <header class="post-header">
        <h2 class="post-title"><a href="/test-2071/">test123</a></h2>
    </header>
    <section class="post-excerpt">
        <p>test123 <a class="read-more" href="/test-2071/">&raquo;</a></p>
    </section>
    <footer class="post-meta">
        
        <a href="/author/jon/">Jon Skeet</a>
        
        <time class="post-date" datetime="2023-01-17">17 January 2023</time>
    </footer>
</article>
<article class="post">
    <header class="post-header">
        <h2 class="post-title"><a href="/test-2070/">test123</a></h2>
    </header>
    <section class="post-excerpt">
        <p>test123 <a class="read-more" href="/test-2070/">&raquo;</a></p>
    </section>
    <footer class="post-meta">
        
        <a href="/author/jon/">Jon Skeet</a>
        
        <time class="post-date" datetime="2023-01-17">17 January 2023</time>
    </footer>
</article>
<article class="post">
    <header class="post-header">
        <h2 class="post-title"><a href="/my-test-post-123-2735/">My test post 1327825715</a></h2>
    </header>
    <section class="post-excerpt">
        <p>A very interesting blog post content <a class="read-more" href="/my-test-post-123-2735/">&raquo;</a></p>
    </section>
    <footer class="post-meta">
        
        <a href="/author/jon/">Jon Skeet</a>
        
        <time class="post-date" datetime="2023-01-17">17 January 2023</time>
    </footer>
</article>
<article class="post">
    <header class="post-header">
        <h2 class="post-title"><a href="/my-test-post-123-2734/">My test post 3673993140</a></h2>
    </header>
    <section class="post-excerpt">
        <p>A very interesting blog post content <a class="read-more" href="/my-test-post-123-2734/">&raquo;</a></p>
    </section>
    <footer class="post-meta">
        
        <a href="/author/jon/">Jon Skeet</a>
        
        <time class="post-date" datetime="2023-01-17">17 January 2023</time>
    </footer>
</article>

<nav class="pagination" role="navigation">
    <span class="page-number">Page 1 of 1054</span>
        <a class="older-posts" href="/page/2/">Older Posts <span aria-hidden="true">&rarr;</span></a>
</nav>


</main>


        <footer class="site-footer clearfix">
            <section class="copyright"><a href="https://loadmill-test-blog.herokuapp.com">Ĥhhhh</a> &copy; 2023</section>
            <section class="poweredby">Proudly published with <a href="https://ghost.org">Ghost</a></section>
        </footer>

    </div>

    <script type="text/javascript" src="//code.jquery.com/jquery-1.12.0.min.js"></script>
    
    <script type="text/javascript" src="/assets/js/jquery.fitvids.js?v=995dffd1a6"></script>
    <script type="text/javascript" src="/assets/js/index.js?v=995dffd1a6"></script>

</body>
</html>
`,
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 200,
      statusText: 'OK',
    },
    timestamp: 1610000000000,
  },
  {
    id: '2',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://facebook.com/users/1',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          'address': {
            'city': 'Anytown',
            'state': 'CA',
            'street': '123 Main St',
            'zipCode': '98765'
          },
          'age': 35,
          'certifications': [
            'Certified ScrumMaster (CSM)',
            'AWS Certified Developer - Associate'
          ],
          'education': [
            {
              'degree': 'Bachelor of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2008,
              'school': 'University of California, Berkeley',
            },
            {
              'degree': 'Master of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2012,
              'school': 'Stanford University',
            }
          ],
          'emailAddresses': [
            'john.doe@example.com',
            'johndoe@work.com'
          ],
          'firstName': 'John',
          'friends': [
            {
              'firstName': 'Jane',
              'lastName': 'Smith'
            },
            {
              'firstName': 'Bob',
              'lastName': 'Johnson'
            }
          ],
          'interests': [
            'hiking', 'photography', 'travel'
          ],
          'isEmployed': true,
          'job': {
            'company': 'Acme Corp',
            'salary': 100000,
            'title': 'Software Engineer',
          },
          'lastName': 'Doe',
          'phoneNumbers': [
            {
              'number': '555-555-1234',
              'type': 'home',
            },
            {
              'number': '555-555-5678',
              'type': 'work',
            }
          ],
          'skills': [
            'JavaScript', 'React', 'Node.js', 'Python'
          ],
        }
        ),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 401,
    },
    timestamp: 1612000000000,
  },
  {
    id: '3',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://facebook.com/users/1',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          'address': {
            'city': 'Anytown',
            'state': 'CA',
            'street': '123 Main St',
            'zipCode': '98765'
          },
          'age': 35,
          'certifications': [
            'Certified ScrumMaster (CSM)',
            'AWS Certified Developer - Associate'
          ],
          'education': [
            {
              'degree': 'Bachelor of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2008,
              'school': 'University of California, Berkeley',
            },
            {
              'degree': 'Master of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2012,
              'school': 'Stanford University',
            }
          ],
          'emailAddresses': [
            'john.doe@example.com',
            'johndoe@work.com'
          ],
          'firstName': 'John',
          'friends': [
            {
              'firstName': 'Jane',
              'lastName': 'Smith'
            },
            {
              'firstName': 'Bob',
              'lastName': 'Johnson'
            }
          ],
          'interests': [
            'hiking', 'photography', 'travel'
          ],
          'isEmployed': true,
          'job': {
            'company': 'Acme Corp',
            'salary': 100000,
            'title': 'Software Engineer',
          },
          'lastName': 'Doe',
          'phoneNumbers': [
            {
              'number': '555-555-1234',
              'type': 'home',
            },
            {
              'number': '555-555-5678',
              'type': 'work',
            }
          ],
          'skills': [
            'JavaScript', 'React', 'Node.js', 'Python'
          ],
        }
        ),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 401,
    },
    timestamp: 1612000000000,
  },
  {
    id: '4',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://facebook.com/users/1',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          'address': {
            'city': 'Anytown',
            'state': 'CA',
            'street': '123 Main St',
            'zipCode': '98765'
          },
          'age': 35,
          'certifications': [
            'Certified ScrumMaster (CSM)',
            'AWS Certified Developer - Associate'
          ],
          'education': [
            {
              'degree': 'Bachelor of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2008,
              'school': 'University of California, Berkeley',
            },
            {
              'degree': 'Master of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2012,
              'school': 'Stanford University',
            }
          ],
          'emailAddresses': [
            'john.doe@example.com',
            'johndoe@work.com'
          ],
          'firstName': 'John',
          'friends': [
            {
              'firstName': 'Jane',
              'lastName': 'Smith'
            },
            {
              'firstName': 'Bob',
              'lastName': 'Johnson'
            }
          ],
          'interests': [
            'hiking', 'photography', 'travel'
          ],
          'isEmployed': true,
          'job': {
            'company': 'Acme Corp',
            'salary': 100000,
            'title': 'Software Engineer',
          },
          'lastName': 'Doe',
          'phoneNumbers': [
            {
              'number': '555-555-1234',
              'type': 'home',
            },
            {
              'number': '555-555-5678',
              'type': 'work',
            }
          ],
          'skills': [
            'JavaScript', 'React', 'Node.js', 'Python'
          ],
        }
        ),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 401,
    },
    timestamp: 1612000000000,
  },
  {
    id: '5',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://facebook.com/users/1',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          'address': {
            'city': 'Anytown',
            'state': 'CA',
            'street': '123 Main St',
            'zipCode': '98765'
          },
          'age': 35,
          'certifications': [
            'Certified ScrumMaster (CSM)',
            'AWS Certified Developer - Associate'
          ],
          'education': [
            {
              'degree': 'Bachelor of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2008,
              'school': 'University of California, Berkeley',
            },
            {
              'degree': 'Master of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2012,
              'school': 'Stanford University',
            }
          ],
          'emailAddresses': [
            'john.doe@example.com',
            'johndoe@work.com'
          ],
          'firstName': 'John',
          'friends': [
            {
              'firstName': 'Jane',
              'lastName': 'Smith'
            },
            {
              'firstName': 'Bob',
              'lastName': 'Johnson'
            }
          ],
          'interests': [
            'hiking', 'photography', 'travel'
          ],
          'isEmployed': true,
          'job': {
            'company': 'Acme Corp',
            'salary': 100000,
            'title': 'Software Engineer',
          },
          'lastName': 'Doe',
          'phoneNumbers': [
            {
              'number': '555-555-1234',
              'type': 'home',
            },
            {
              'number': '555-555-5678',
              'type': 'work',
            }
          ],
          'skills': [
            'JavaScript', 'React', 'Node.js', 'Python'
          ],
        }
        ),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 401,
    },
    timestamp: 1612000000000,
  },
  {
    id: '6',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://facebook.com/users/1',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          'address': {
            'city': 'Anytown',
            'state': 'CA',
            'street': '123 Main St',
            'zipCode': '98765'
          },
          'age': 35,
          'certifications': [
            'Certified ScrumMaster (CSM)',
            'AWS Certified Developer - Associate'
          ],
          'education': [
            {
              'degree': 'Bachelor of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2008,
              'school': 'University of California, Berkeley',
            },
            {
              'degree': 'Master of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2012,
              'school': 'Stanford University',
            }
          ],
          'emailAddresses': [
            'john.doe@example.com',
            'johndoe@work.com'
          ],
          'firstName': 'John',
          'friends': [
            {
              'firstName': 'Jane',
              'lastName': 'Smith'
            },
            {
              'firstName': 'Bob',
              'lastName': 'Johnson'
            }
          ],
          'interests': [
            'hiking', 'photography', 'travel'
          ],
          'isEmployed': true,
          'job': {
            'company': 'Acme Corp',
            'salary': 100000,
            'title': 'Software Engineer',
          },
          'lastName': 'Doe',
          'phoneNumbers': [
            {
              'number': '555-555-1234',
              'type': 'home',
            },
            {
              'number': '555-555-5678',
              'type': 'work',
            }
          ],
          'skills': [
            'JavaScript', 'React', 'Node.js', 'Python'
          ],
        }
        ),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 401,
    },
    timestamp: 1612000000000,
  },
  {
    id: '7',
    request: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          name: 'John Doe'
        }),
      },
      headers: [
        {
          name: 'Accept',
          value: 'application/json'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      method: 'GET',
      url: 'https://facebook.com/users/1',
    },
    response: {
      body: {
        mimeType: 'application/json',
        text: JSON.stringify({
          'address': {
            'city': 'Anytown',
            'state': 'CA',
            'street': '123 Main St',
            'zipCode': '98765'
          },
          'age': 35,
          'certifications': [
            'Certified ScrumMaster (CSM)',
            'AWS Certified Developer - Associate'
          ],
          'education': [
            {
              'degree': 'Bachelor of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2008,
              'school': 'University of California, Berkeley',
            },
            {
              'degree': 'Master of Science',
              'fieldOfStudy': 'Computer Science',
              'graduationYear': 2012,
              'school': 'Stanford University',
            }
          ],
          'emailAddresses': [
            'john.doe@example.com',
            'johndoe@work.com'
          ],
          'firstName': 'John',
          'friends': [
            {
              'firstName': 'Jane',
              'lastName': 'Smith'
            },
            {
              'firstName': 'Bob',
              'lastName': 'Johnson'
            }
          ],
          'interests': [
            'hiking', 'photography', 'travel'
          ],
          'isEmployed': true,
          'job': {
            'company': 'Acme Corp',
            'salary': 100000,
            'title': 'Software Engineer',
          },
          'lastName': 'Doe',
          'phoneNumbers': [
            {
              'number': '555-555-1234',
              'type': 'home',
            },
            {
              'number': '555-555-5678',
              'type': 'work',
            }
          ],
          'skills': [
            'JavaScript', 'React', 'Node.js', 'Python'
          ],
        }
        ),
      },
      headers: [
        {
          name: 'Content-Type',
          value: 'application/json'
        },
      ],
      status: 401,
    },
    timestamp: 1612000000000,
  },
];
