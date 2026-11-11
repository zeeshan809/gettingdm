"use client";

import { useState } from "react";
import { Check, Minus, Plus } from "lucide-react";
import { Modal, useToast } from "@/components/interactive";
import { Button, Card, CardHeader, Field, Input, PageHeader, Select, Table, Td, Th } from "@/components/ui";
import { adminUsers, rolePermissions } from "@/lib/mock-data";
import { dateTime } from "@/lib/format";

const roles = ["Super Admin", "Operations Admin", "Finance Admin", "Support Admin"];

export default function AdminRolesPage() {
  const toast = useToast();
  const [inviting, setInviting] = useState(false);
  const yes = (v: boolean) => (v ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <Minus className="mx-auto h-4 w-4 text-zinc-300" />);

  return (
    <>
      <PageHeader title="Admins & roles" actions={<Button onClick={() => setInviting(true)}><Plus className="h-4 w-4" /> Invite admin</Button>} />

      <Card>
        <CardHeader title="Admin users" />
        <Table>
          <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Last active</Th></tr></thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id}>
                <Td className="font-medium">{u.name}</Td>
                <Td>{u.email}</Td>
                <Td>
                  <Select className="h-8 w-44 text-xs" defaultValue={u.role} onChange={(e) => toast(`${u.name} → ${e.target.value} (audit logged)`)}>
                    {roles.map((r) => <option key={r}>{r}</option>)}
                  </Select>
                </Td>
                <Td>{dateTime(u.lastActive)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Role permissions" />
        <Table>
          <thead><tr><Th>Permission</Th>{roles.map((r) => <Th key={r} className="text-center">{r}</Th>)}</tr></thead>
          <tbody>
            {rolePermissions.map((p) => (
              <tr key={p.area}>
                <Td>{p.area}</Td>
                <Td>{yes(p.super)}</Td>
                <Td>{yes(p.ops)}</Td>
                <Td>{yes(p.finance)}</Td>
                <Td>{yes(p.support)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal
        open={inviting}
        onClose={() => setInviting(false)}
        title="Invite admin"
        footer={<>
          <Button variant="secondary" onClick={() => setInviting(false)}>Cancel</Button>
          <Button onClick={() => { setInviting(false); toast("Invitation sent"); }}>Send invite</Button>
        </>}
      >
        <div className="space-y-3">
          <Field label="Email"><Input type="email" /></Field>
          <Field label="Role"><Select>{roles.map((r) => <option key={r}>{r}</option>)}</Select></Field>
        </div>
      </Modal>
    </>
  );
}
