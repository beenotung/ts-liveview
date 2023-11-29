import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2'

function showToast(title: SweetAlertOptions['title'], icon: SweetAlertIcon) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: toast => {
      toast.onmouseenter = Swal.stopTimer
      toast.onmouseleave = Swal.resumeTimer
    },
  })
  Toast.fire({
    icon,
    title,
  })
}

Object.assign(window, {
  Swal,
  showToast,
})
