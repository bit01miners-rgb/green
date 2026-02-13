import { toast } from "sonner"

export { toast }

export function useToast() {
  return {
    toast: (props: any) => {
      if (typeof props === 'string') {
        toast(props);
      } else {
        const { title, description, variant } = props;
        if (variant === 'destructive') {
          toast.error(title, { description });
        } else {
          toast(title, { description });
        }
      }
    },
    dismiss: toast.dismiss,
  }
}
