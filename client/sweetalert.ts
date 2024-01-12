import Swal, {
  SweetAlertIcon,
  SweetAlertOptions,
} from 'sweetalert2-unrestricted'

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

function showAlert(title: SweetAlertOptions['title'], icon: SweetAlertIcon) {
  Swal.fire({
    title,
    icon,
    heightAuto: false,
  })
}

Object.assign(window, {
  Swal,
  showToast,
  showAlert,
})
