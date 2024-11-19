// supabase.js
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ooeqerjvhkhqmaaratox.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vZXFlcmp2aGtocW1hYXJhdG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5OTUxMTAsImV4cCI6MjA0NzU3MTExMH0.CRg5F0NcsLdpXUwsvR1jGYgIF7kVFMXuz0AsqHFuxKE'
const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase
