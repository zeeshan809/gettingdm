"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Modal, useToast } from "@/components/interactive";
import { Button } from "@/components/ui";
import { disconnect } from "./actions";

export function DisconnectButton() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      await disconnect();
      setOpen(false);
      toast("Instagram disconnected");
      router.replace("/instagram");
      router.refresh();
    });

  return (
    <>
      <Button variant="danger-outline" onClick={() => setOpen(true)}>Disconnect</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Disconnect Instagram?"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirm} disabled={pending}>{pending ? "Disconnecting…" : "Disconnect"}</Button>
        </>}
      >
        All campaigns will stop replying to comments until you reconnect. We delete your Instagram access token. Your campaigns and storefront are kept.
      </Modal>
    </>
  );
}
