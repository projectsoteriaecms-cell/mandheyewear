

# Invite jerryadeyemi20@gmail.com as Admin

The invitation system is already fully built. Here's what needs to happen:

## Approach

Since you're currently logged in as Super Admin on the `/admin` page, the fastest path is to **use the existing Invite User UI** on the Admin Users page:

1. Navigate to **Admin → Users** in the sidebar
2. Click **"Invite User"** button
3. Enter `jerryadeyemi20@gmail.com`
4. Select **Admin** role
5. Click **Send Invitation**

This will:
- Create an invitation record in the `user_invitations` table with role = `admin`
- Send an email via the `send-user-invitation` edge function (using Resend) with a signup link
- When Jerry signs up using that link, the `handle_new_user` database trigger automatically assigns the `admin` role

## No Code Changes Needed

The entire flow is already implemented:
- `InviteUserDialog` creates the invitation and sends the email
- `handle_new_user()` trigger checks for pending invitations on signup and assigns the invited role
- RLS policies allow admin/super_admin to create invitations

## Action

You can do this right now from your admin panel — go to **Users** in the sidebar and click **Invite User**. Would you like me to walk you through it, or would you prefer I send the invitation programmatically via the backend?

