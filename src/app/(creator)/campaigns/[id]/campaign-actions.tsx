"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pause, Play, Trash2 } from "lucide-react";
import { Modal, useToast } from "@/components/interactive";
import { Button, FormError } from "@/components/ui";
import { deleteCampaign, setCampaignActive } from "../actions";

export function CampaignActions({ id, name, active }: { id: string; name: string; active: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const toggle = () =>
    startTransition(async () => {
      const result = await setCampaignActive(id, !active);
      if ("error" in result) return toast(result.error);
      toast(active ? "Campaign paused" : "Campaign resumed");
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      const result = await deleteCampaign(id);
      if ("error" in result) return setError(result.error);
      toast("Campaign deleted");
      router.push("/campaigns");
    });

  return (
    <>
      <Button variant="secondary" onClick={toggle} disabled={pending}>
        {active ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Resume</>}
      </Button>
      <Button variant="secondary" onClick={() => setConfirming(true)} disabled={pending} aria-label="Delete campaign">
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete campaign?"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
          <Button variant="danger" onClick={remove} disabled={pending}>{pending ? "Deleting…" : "Delete campaign"}</Button>
        </>}
      >
        <div className="space-y-3 text-sm">
          <FormError>{error}</FormError>
          <p>
            <span className="font-medium">{name}</span> will stop replying to comments immediately, and its link will no longer show on your storefront.
            Past DM and click history stays in your analytics. This can&apos;t be undone.
          </p>
          <p className="text-zinc-500">To stop it temporarily, pause it instead.</p>
        </div>
      </Modal>
    </>
  );
}
