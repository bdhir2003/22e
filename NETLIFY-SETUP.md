# To enable Netlify Identity (Email Authentication):

## Step 1: Enable Netlify Identity in your Netlify Dashboard
1. Go to your Netlify site dashboard
2. Navigate to Site settings > Identity
3. Click "Enable Identity"
4. Under "Registration", choose "Invite only" (recommended for admin access)
5. Under "External providers", you can enable Google, GitHub, etc.

## Step 2: Add your admin email
1. In Identity tab, click "Invite users"
2. Enter your email address
3. You'll receive an invitation email

## Step 3: Set up redirect rules
Add this to your netlify.toml file:

```toml
[build]
  publish = "."

# Redirect rules for admin access
[[redirects]]
  from = "/admin"
  to = "/netlify-admin-login.html"
  status = 200

# Protect admin files
[[headers]]
  for = "/secret-*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
```

## Step 4: Update your admin file references
- Use `/admin` as your admin URL (will redirect to netlify-admin-login.html)
- Or bookmark `netlify-admin-login.html` directly

## Security Benefits:
✅ Real email authentication
✅ Password reset functionality  
✅ Integration with OAuth providers (Google, GitHub)
✅ Secure token-based authentication
✅ Session management handled by Netlify

## Quick Setup:
1. Deploy your site to Netlify
2. Enable Identity in Netlify dashboard
3. Invite yourself as a user
4. Use netlify-admin-login.html for secure access
