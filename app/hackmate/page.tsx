import { redirect } from 'next/navigation';

export default function HackmateRedirect() {
  // Redirect old Hackmate route to new HackHub
  redirect('/hackhub');
}