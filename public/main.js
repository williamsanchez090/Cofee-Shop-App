// 1. Cashier can send orders with customer name to the database (post) => completed
// 2. Baristas can log in and see the orders (sign in) => "add the order to a queue"
// 3. Baristas can mark the order complete (update)
// 4. Completed orders should show which Barista completed the order and have thier own list (can filter population results)
// Bonus: app automatically says the customer's name out loud when the order is complete
const complete = document.getElementsByClassName("fa-circle-check")
const remove = document.getElementsByClassName("fa-ban");

Array.from(complete).forEach(function (element) {
    element.addEventListener('click', function () {
        const _id = this.parentNode.parentNode.id
        const barista = this.parentNode.parentNode.parentNode.children[1].innerText
        console.log(_id, barista)
      fetch('orderComplete', {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '_id': _id,
          'barista': barista
        })
      })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
    })
  })  

Array.from(remove).forEach(function(element) {
  element.addEventListener('click', function(){
    const _id = this.parentNode.parentNode.id
    console.log(_id)

    fetch('orderDelete', {
      method: 'delete',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        '_id': _id
      })
    }).then(function (response) {
      window.location.reload()
    })
  });
});