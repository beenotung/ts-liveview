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

async function showConfirm(options: {
  title: SweetAlertOptions['title']
  icon?: SweetAlertIcon
  confirmButtonText?: string
  cancelButtonText?: string
}) {
  let result = await Swal.fire({
    title: options.title,
    icon: options.icon,
    showConfirmButton: true,
    showCancelButton: true,
    heightAuto: false,
    confirmButtonText: options.confirmButtonText,
    cancelButtonText: options.cancelButtonText,
  })
  return result.isConfirmed
}

Object.assign(window, {
  Swal,
  showToast,
  showAlert,
  showConfirm,
})
