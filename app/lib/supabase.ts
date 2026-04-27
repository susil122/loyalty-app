import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pnzkyiaklkinwwpzusnp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuemt5aWFrbGtpbnd3cHp1c25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNDkzMTQsImV4cCI6MjA5MjcyNTMxNH0.qwMMhMer8VBdDavB3CyQNuvn0W_VN3ioZMaKxL9xLEI'

export const supabase = createClient(supabaseUrl, supabaseKey)