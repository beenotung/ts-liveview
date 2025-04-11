import Swal, {
  SweetAlertIcon,
  SweetAlertOptions,
  SweetAlertPosition,
} from 'sweetalert2-unrestricted'
import { client_config } from './client-config.js'

function showToast(
  title: SweetAlertOptions['title'],
  icon: SweetAlertIcon,
  position: SweetAlertPosition = 'top-end',
) {
  const Toast = Swal.mixin({
    toast: true,
    position,
    showConfirmButton: false,
    timer: client_config.toast_duration,
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

async function showAlert(
  title: SweetAlertOptions['title'],
  icon: SweetAlertIcon,
) {
  await Swal.fire({
    title,
    icon,
    heightAuto: false,
  })
}

async function showConfirm(options: {
  title: SweetAlertOptions['title']
  text?: SweetAlertOptions['text']
  icon?: SweetAlertIcon
  confirmButtonText?: string
  cancelButtonText?: string
}) {
  let result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon,
    showConfirmButton: true,
    showCancelButton: true,
    heightAuto: false,
    confirmButtonText: options.confirmButtonText || 'Confirm',
    cancelButtonText: options.cancelButtonText || 'Cancel',
  })
  return result.isConfirmed
}

Object.assign(window, {
  Swal,
  showToast,
  showAlert,
  showConfirm,
})
