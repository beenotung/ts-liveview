export let scripts = `<script>
window.addEventListener('hashchange',function(){
  send('hash', location.hash)
})
</script>`
