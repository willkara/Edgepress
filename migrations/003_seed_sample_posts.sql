-- Seed Sample Data (Generated via script)
-- Inserts categories, tags, and sample posts using strictly ISO 8601 UTC dates.

-- 1. Categories
INSERT OR IGNORE INTO categories (id, name, slug, created_at) VALUES
('cat_tech', 'Technology', 'technology', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('cat_life', 'Lifestyle', 'lifestyle', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- 2. Tags
INSERT OR IGNORE INTO tags (id, name, slug, created_at) VALUES
('tag_svelte', 'SvelteKit', 'sveltekit', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_edge', 'Edge Computing', 'edge-computing', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_db', 'Database', 'database', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_tech', 'Technology', 'technology', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_web', 'Web Dev', 'web-dev', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_life', 'Lifestyle', 'lifestyle', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_health', 'Health', 'health', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_coding', 'Coding', 'coding', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_philosophy', 'Philosophy', 'philosophy', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
('tag_productivity', 'Productivity', 'productivity', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

-- 3. Initial Admin (Re-inserting correctly for seed consistency)
INSERT OR IGNORE INTO users (id, email, password_hash, display_name, created_at, updated_at)
VALUES (
    'user_admin',
    'admin@example.com',
    '$2a$10$r.z.i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i/i', -- Placeholder
    'EdgePress Admin',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);

-- 4. Sample Posts
INSERT OR REPLACE INTO posts (
    id, author_id, category_id, title, slug,
    content_md, content_html, excerpt,
    status, published_at, created_at, updated_at, reading_time, view_count
) VALUES
(
    'post_1',
    'user_admin',
    'cat_tech',
    'Welcome to EdgePress',
    'welcome-to-edgepress',
    '# Welcome to EdgePress

Welcome to your new blogging platform! **EdgePress** is designed to run on the edge, providing lightning-fast performance and global availability.

## Why Edge?

Edge computing moves the processing closer to the user. This means:
*   **Lower Latency:** Data travels shorter distances.
*   **Higher Reliability:** Distributed network ensures uptime.
*   **Scalability:** Automatically handles traffic spikes.

### Code Example

Here is a simple Svelte component:

```svelte
<script>
  let count = 0;
</script>

<button on:click={() => count++}>
  Clicks: {count}
</button>
```

## Getting Started

Check out the admin panel to start writing your own posts. You can use Markdown to format your content, add images, and more.
',
    '<h1>Welcome to EdgePress</h1>
<p>Welcome to your new blogging platform! <strong>EdgePress</strong> is designed to run on the edge, providing lightning-fast performance and global availability.</p>
<h2>Why Edge?</h2>
<p>Edge computing moves the processing closer to the user. This means:</p>
<ul>
<li><strong>Lower Latency:</strong> Data travels shorter distances.</li>
<li><strong>Higher Reliability:</strong> Distributed network ensures uptime.</li>
<li><strong>Scalability:</strong> Automatically handles traffic spikes.</li>
</ul>
<h3>Code Example</h3>
<p>Here is a simple Svelte component:</p>
<pre><code class="language-svelte">&lt;script&gt;
  let count = 0;
&lt;/script&gt;

&lt;button on:click={() =&gt; count++}&gt;
  Clicks: {count}
&lt;/button&gt;
</code></pre>
<h2>Getting Started</h2>
<p>Check out the admin panel to start writing your own posts. You can use Markdown to format your content, add images, and more.</p>
',
    'A first look at the new blogging platform running on the edge.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-6 hours'),
    2,
    52
),
(
    'post_2',
    'user_admin',
    'cat_tech',
    'Understanding D1 and SvelteKit',
    'understanding-d1-sveltekit',
    '# Understanding D1 and SvelteKit

Cloudflare D1 is a native serverless SQL database. Combined with SvelteKit, it creates a powerful stack for building dynamic applications.

## What is D1?

D1 is built on SQLite. It''s:
1.  **Serverless:** No servers to manage.
2.  **Global:** Read replication across the globe.
3.  **Consistent:** Strong consistency guarantees.

> "D1 changes the game for edge persistence."

## Integration Guide

To query D1 in SvelteKit:

```typescript
export const load = async ({ platform }) => {
  const result = await platform.env.DB.prepare(''SELECT * FROM posts'').all();
  return { posts: result.results };
};
```

This simple pattern allows you to build data-driven applications right on the edge.
',
    '<h1>Understanding D1 and SvelteKit</h1>
<p>Cloudflare D1 is a native serverless SQL database. Combined with SvelteKit, it creates a powerful stack for building dynamic applications.</p>
<h2>What is D1?</h2>
<p>D1 is built on SQLite. It&#39;s:</p>
<ol>
<li><strong>Serverless:</strong> No servers to manage.</li>
<li><strong>Global:</strong> Read replication across the globe.</li>
<li><strong>Consistent:</strong> Strong consistency guarantees.</li>
</ol>
<blockquote>
<p>&quot;D1 changes the game for edge persistence.&quot;</p>
</blockquote>
<h2>Integration Guide</h2>
<p>To query D1 in SvelteKit:</p>
<pre><code class="language-typescript">export const load = async ({ platform }) =&gt; {
  const result = await platform.env.DB.prepare(&#39;SELECT * FROM posts&#39;).all();
  return { posts: result.results };
};
</code></pre>
<p>This simple pattern allows you to build data-driven applications right on the edge.</p>
',
    'A deep dive into how Cloudflare D1 integrates with SvelteKit for full-stack apps.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-9 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-9 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-9 hours'),
    5,
    21
),
(
    'post_3',
    'user_admin',
    'cat_tech',
    'The Future of Web Development',
    'future-of-web-dev',
    '# The Future of Web Development

The web is constantly evolving. From static HTML to complex SPAs, and now back to server-side rendering and edge computing.

## Key Trends

### 1. The Return of SSR
Server-Side Rendering (SSR) is back, but it''s smarter. Frameworks like **SvelteKit**, **Next.js**, and **Nuxt** are making it easier to blend static and dynamic content.

### 2. Edge Computing
Running code at the edge (like this blog!) is becoming the standard for high-performance applications.

| Feature | Legacy Cloud | Edge Computing |
| :--- | :--- | :--- |
| Latency | High | Low |
| Scalability | Manual/Auto | Instant |
| Cost | Pay for idle | Pay per request |

### 3. AI Integration
AI is no longer just a buzzword. It''s helping us write code, generate content, and optimize user experiences.
',
    '<h1>The Future of Web Development</h1>
<p>The web is constantly evolving. From static HTML to complex SPAs, and now back to server-side rendering and edge computing.</p>
<h2>Key Trends</h2>
<h3>1. The Return of SSR</h3>
<p>Server-Side Rendering (SSR) is back, but it&#39;s smarter. Frameworks like <strong>SvelteKit</strong>, <strong>Next.js</strong>, and <strong>Nuxt</strong> are making it easier to blend static and dynamic content.</p>
<h3>2. Edge Computing</h3>
<p>Running code at the edge (like this blog!) is becoming the standard for high-performance applications.</p>
<table>
<thead>
<tr>
<th align="left">Feature</th>
<th align="left">Legacy Cloud</th>
<th align="left">Edge Computing</th>
</tr>
</thead>
<tbody><tr>
<td align="left">Latency</td>
<td align="left">High</td>
<td align="left">Low</td>
</tr>
<tr>
<td align="left">Scalability</td>
<td align="left">Manual/Auto</td>
<td align="left">Instant</td>
</tr>
<tr>
<td align="left">Cost</td>
<td align="left">Pay for idle</td>
<td align="left">Pay per request</td>
</tr>
</tbody></table>
<h3>3. AI Integration</h3>
<p>AI is no longer just a buzzword. It&#39;s helping us write code, generate content, and optimize user experiences.</p>
',
    'Exploring the trends shaping the next decade of the web.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-12 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-12 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-12 hours'),
    7,
    47
),
(
    'post_4',
    'user_admin',
    'cat_life',
    '5 Tips for a Balanced Life',
    '5-tips-balanced-life',
    '# 5 Tips for a Balanced Life

In our fast-paced world, finding balance is essential. Here are five tips to help you stay grounded.

## 1. Disconnect to Reconnect
Take time away from screens. A walk in nature can do wonders for your mental health.

## 2. Prioritize Sleep
Sleep is when your body and mind repair themselves. Aim for 7-9 hours a night.

## 3. Eat Whole Foods
Nutrition fuels your body. Focus on vegetables, fruits, and lean proteins.

*   Apple
*   Banana
*   Carrot

## 4. Move Your Body
Exercise doesn''t have to be intense. A 30-minute walk is great.

## 5. Practice Gratitude
Take a moment each day to reflect on what you are thankful for.
',
    '<h1>5 Tips for a Balanced Life</h1>
<p>In our fast-paced world, finding balance is essential. Here are five tips to help you stay grounded.</p>
<h2>1. Disconnect to Reconnect</h2>
<p>Take time away from screens. A walk in nature can do wonders for your mental health.</p>
<h2>2. Prioritize Sleep</h2>
<p>Sleep is when your body and mind repair themselves. Aim for 7-9 hours a night.</p>
<h2>3. Eat Whole Foods</h2>
<p>Nutrition fuels your body. Focus on vegetables, fruits, and lean proteins.</p>
<ul>
<li>Apple</li>
<li>Banana</li>
<li>Carrot</li>
</ul>
<h2>4. Move Your Body</h2>
<p>Exercise doesn&#39;t have to be intense. A 30-minute walk is great.</p>
<h2>5. Practice Gratitude</h2>
<p>Take a moment each day to reflect on what you are thankful for.</p>
',
    'Simple habits to improve your daily well-being and productivity.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-15 hours'),
    4,
    50
),
(
    'post_5',
    'user_admin',
    'cat_tech',
    'Minimalism in Coding',
    'minimalism-in-coding',
    '# Minimalism in Coding

"Less is more." This architectural philosophy applies perfectly to software development.

## The Cost of Code

Every line of code is a liability. It must be:
*   Read
*   Tested
*   Maintained
*   Debugged

## How to Reduce Code

1.  **YAGNI (You Ain''t Gonna Need It):** Don''t build features until they are necessary.
2.  **DRY (Don''t Repeat Yourself):** Abstract common logic.
3.  **Use Libraries Wisely:** Don''t reinvent the wheel, but don''t import a massive library for a simple function.

## Conclusion

Strive for simplicity. Your future self (and your teammates) will thank you.
',
    '<h1>Minimalism in Coding</h1>
<p>&quot;Less is more.&quot; This architectural philosophy applies perfectly to software development.</p>
<h2>The Cost of Code</h2>
<p>Every line of code is a liability. It must be:</p>
<ul>
<li>Read</li>
<li>Tested</li>
<li>Maintained</li>
<li>Debugged</li>
</ul>
<h2>How to Reduce Code</h2>
<ol>
<li><strong>YAGNI (You Ain&#39;t Gonna Need It):</strong> Don&#39;t build features until they are necessary.</li>
<li><strong>DRY (Don&#39;t Repeat Yourself):</strong> Abstract common logic.</li>
<li><strong>Use Libraries Wisely:</strong> Don&#39;t reinvent the wheel, but don&#39;t import a massive library for a simple function.</li>
</ol>
<h2>Conclusion</h2>
<p>Strive for simplicity. Your future self (and your teammates) will thank you.</p>
',
    'Why writing less code is often the best solution.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-18 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-18 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-18 hours'),
    3,
    24
),
(
    'post_6',
    'user_admin',
    'cat_life',
    'My Morning Routine',
    'my-morning-routine',
    '# My Morning Routine

A good morning starts the night before, but here is how I structure my AM hours.

## The Schedule

*   **06:00:** Wake up and hydrate.
*   **06:15:** Light stretching or yoga.
*   **06:45:** Coffee and reading (non-fiction).
*   **07:30:** Deep work session #1.

## Why This Works

Starting with personal time rather than checking emails allows me to be proactive instead of reactive.

> "Win the morning, win the day."
',
    '<h1>My Morning Routine</h1>
<p>A good morning starts the night before, but here is how I structure my AM hours.</p>
<h2>The Schedule</h2>
<ul>
<li><strong>06:00:</strong> Wake up and hydrate.</li>
<li><strong>06:15:</strong> Light stretching or yoga.</li>
<li><strong>06:45:</strong> Coffee and reading (non-fiction).</li>
<li><strong>07:30:</strong> Deep work session #1.</li>
</ul>
<h2>Why This Works</h2>
<p>Starting with personal time rather than checking emails allows me to be proactive instead of reactive.</p>
<blockquote>
<p>&quot;Win the morning, win the day.&quot;</p>
</blockquote>
',
    'How I start my day for maximum productivity and happiness.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-21 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-21 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-21 hours'),
    3,
    42
),
(
    'post_7',
    'user_admin',
    'cat_tech',
    'Svelte 5 Runes: A Quick Look',
    'svelte-5-runes',
    '# Svelte 5 Runes: A Quick Look

Svelte 5 introduces "runes" to handle reactivity. It''s a significant shift that brings more explicit control.

## The `$state` Rune

Instead of `let count = 0`, we now use:

```javascript
let count = $state(0);
```

## The `$derived` Rune

Derived values are now explicit:

```javascript
let double = $derived(count * 2);
```

## The `$effect` Rune

Side effects are handled with `$effect`:

```javascript
$effect(() => {
	console.log(count);
});
```

This new model resolves many edge cases with the previous compiler-based reactivity and makes Svelte even more powerful.
',
    '<h1>Svelte 5 Runes: A Quick Look</h1>
<p>Svelte 5 introduces &quot;runes&quot; to handle reactivity. It&#39;s a significant shift that brings more explicit control.</p>
<h2>The <code>$state</code> Rune</h2>
<p>Instead of <code>let count = 0</code>, we now use:</p>
<pre><code class="language-javascript">let count = $state(0);
</code></pre>
<h2>The <code>$derived</code> Rune</h2>
<p>Derived values are now explicit:</p>
<pre><code class="language-javascript">let double = $derived(count * 2);
</code></pre>
<h2>The <code>$effect</code> Rune</h2>
<p>Side effects are handled with <code>$effect</code>:</p>
<pre><code class="language-javascript">$effect(() =&gt; {
	console.log(count);
});
</code></pre>
<p>This new model resolves many edge cases with the previous compiler-based reactivity and makes Svelte even more powerful.</p>
',
    'Exploring the new reactivity model in Svelte 5.',
    'published',
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-24 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-24 hours'),
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-24 hours'),
    4,
    6
);

-- 5. Post Tags
INSERT OR REPLACE INTO post_tags (post_id, tag_id) VALUES
('post_1', 'tag_svelte'),
('post_1', 'tag_edge'),
('post_2', 'tag_db'),
('post_2', 'tag_edge'),
('post_2', 'tag_svelte'),
('post_3', 'tag_tech'),
('post_3', 'tag_web'),
('post_4', 'tag_life'),
('post_4', 'tag_health'),
('post_5', 'tag_coding'),
('post_5', 'tag_philosophy'),
('post_6', 'tag_life'),
('post_6', 'tag_productivity'),
('post_7', 'tag_svelte'),
('post_7', 'tag_coding');
