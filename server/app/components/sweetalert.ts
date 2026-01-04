import type { Context } from '../context'
import type { SweetAlertPosition } from 'sweetalert2-unrestricted'
import type { SweetAlertIcon } from 'sweetalert2-unrestricted'
import type { ServerMessage } from '../../../client/types'
import { Locale, LocaleVariants } from './locale.js'
import { invoke } from './eval.js'

/*********************************
 * Helper function for showToast *
 *********************************/

export type MakeToastMessageArgs = {
  title: LocaleVariants<string>
  icon: SweetAlertIcon
  position?: SweetAlertPosition
  timer?: number
}

export function makeToast(context: Context) {
  function showToast(
    title: LocaleVariants<string>,
    icon: SweetAlertIcon,
    position?: SweetAlertPosition,
    timer?: number,
  ) {
    return {
      message: makeToastMessage({ title, icon, position, timer }, context),
    }
  }
  return showToast
}

export function makeToastMessage(args: MakeToastMessageArgs, context: Context) {
  return invoke('showToast', [
    Locale(args.title, context),
    args.icon,
    args.position,
    args.timer,
  ]) satisfies ServerMessage
}

/*********************************
 * Helper function for showAlert *
 *********************************/

export type MakeAlertMessageArgs = {
  title: LocaleVariants<string>
  icon: SweetAlertIcon
}

export function makeAlert(context: Context) {
  function alert(title: LocaleVariants<string>, icon: SweetAlertIcon) {
    return {
      message: makeAlertMessage({ title, icon }, context),
    }
  }
  return alert
}

export function makeAlertMessage(args: MakeAlertMessageArgs, context: Context) {
  return invoke('showAlert', [
    Locale(args.title, context),
    args.icon,
  ]) satisfies ServerMessage
}

/***********************************
 * Helper function for showConfirm *
 ***********************************/

export type MakeConfirmMessageArgs = {
  title: LocaleVariants<string>
  text?: LocaleVariants<string>
  icon?: SweetAlertIcon
  confirmButtonText?: LocaleVariants<string>
  cancelButtonText?: LocaleVariants<string>
}

export function makeConfirm(context: Context) {
  function confirm(
    title: LocaleVariants<string>,
    text?: LocaleVariants<string>,
    icon?: SweetAlertIcon,
    confirmButtonText?: LocaleVariants<string>,
    cancelButtonText?: LocaleVariants<string>,
  ) {
    return {
      message: makeConfirmMessage(
        { title, text, icon, confirmButtonText, cancelButtonText },
        context,
      ),
    }
  }
  return confirm
}

export function makeConfirmMessage(
  args: MakeConfirmMessageArgs,
  context: Context,
) {
  let { title, text, icon, confirmButtonText, cancelButtonText } = args
  let t = (args?: LocaleVariants<string>) =>
    args ? Locale(args, context) : undefined
  let options = {
    title: t(title),
    text: t(text),
    icon: icon,
    confirmButtonText: t(confirmButtonText),
    cancelButtonText: t(cancelButtonText),
  }
  return invoke('showConfirm', [options]) satisfies ServerMessage
}
