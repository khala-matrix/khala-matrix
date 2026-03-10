"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

type NodeStatus = "online" | "degraded" | "offline";

type NetworkNode = {
  id: string;
  name: string;
  address: string;
  region: string;
  status: NodeStatus;
  registeredAt: string;
  tags: string[];
};

const INITIAL_NODES: NetworkNode[] = [
  {
    id: "node-1",
    name: "Alpha Gateway",
    address: "10.10.1.4:51820",
    region: "Singapore",
    status: "online",
    registeredAt: "2026-02-11",
    tags: ["edge", "critical"],
  },
  {
    id: "node-2",
    name: "Beta Compute",
    address: "10.10.8.21:51820",
    region: "Tokyo",
    status: "degraded",
    registeredAt: "2026-02-18",
    tags: ["compute"],
  },
  {
    id: "node-3",
    name: "Gamma Storage",
    address: "10.10.14.9:51820",
    region: "Frankfurt",
    status: "offline",
    registeredAt: "2026-02-27",
    tags: ["storage", "backup"],
  },
];

function createNodeId() {
  return `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function updateNodeById(
  nodes: NetworkNode[],
  nodeId: string,
  updater: (node: NetworkNode) => NetworkNode,
) {
  return nodes.map((node) => (node.id === nodeId ? updater(node) : node));
}

export default function DashboardPage() {
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NODES);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  const [registerName, setRegisterName] = useState("");
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerRegion, setRegisterRegion] = useState("");

  const [nameDrafts, setNameDrafts] = useState<Record<string, string>>({});
  const [newTagDrafts, setNewTagDrafts] = useState<Record<string, string>>({});
  const [editingTag, setEditingTag] = useState<{
    index: number;
    nodeId: string;
    value: string;
  } | null>(null);

  const expandedNode = useMemo(
    () => nodes.find((node) => node.id === expandedNodeId) ?? null,
    [nodes, expandedNodeId],
  );

  const nameDraft =
    expandedNode && nameDrafts[expandedNode.id] !== undefined
      ? nameDrafts[expandedNode.id]
      : expandedNode?.name ?? "";
  const newTagDraft = expandedNode ? (newTagDrafts[expandedNode.id] ?? "") : "";

  const handleRegisterNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = registerName.trim();
    const address = registerAddress.trim();
    const region = registerRegion.trim();

    if (!name || !address || !region) {
      return;
    }

    const node: NetworkNode = {
      id: createNodeId(),
      name,
      address,
      region,
      status: "online",
      registeredAt: new Date().toISOString().slice(0, 10),
      tags: [],
    };

    setNodes((prev) => [...prev, node]);
    setExpandedNodeId(node.id);
    setRegisterName("");
    setRegisterAddress("");
    setRegisterRegion("");
  };

  const handleRenameNode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expandedNodeId) {
      return;
    }

    const nextName = nameDraft.trim();
    if (!nextName) {
      return;
    }

    setNodes((prev) =>
      updateNodeById(prev, expandedNodeId, (node) => ({ ...node, name: nextName })),
    );
    setNameDrafts((prev) => ({ ...prev, [expandedNodeId]: nextName }));
  };

  const handleAddTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expandedNodeId) {
      return;
    }

    const nextTag = newTagDraft.trim();
    if (!nextTag) {
      return;
    }

    setNodes((prev) =>
      updateNodeById(prev, expandedNodeId, (node) => {
        if (node.tags.some((tag) => tag.toLowerCase() === nextTag.toLowerCase())) {
          return node;
        }

        return {
          ...node,
          tags: [...node.tags, nextTag],
        };
      }),
    );
    setNewTagDrafts((prev) => ({ ...prev, [expandedNodeId]: "" }));
  };

  const handleDeleteTag = (tagIndex: number) => {
    if (!expandedNodeId) {
      return;
    }

    setNodes((prev) =>
      updateNodeById(prev, expandedNodeId, (node) => ({
        ...node,
        tags: node.tags.filter((_, index) => index !== tagIndex),
      })),
    );
    setEditingTag((prev) => {
      if (!prev || prev.nodeId !== expandedNodeId || prev.index !== tagIndex) {
        return prev;
      }
      return null;
    });
  };

  const handleSaveTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expandedNodeId || !editingTag || editingTag.nodeId !== expandedNodeId) {
      return;
    }

    const nextTag = editingTag.value.trim();
    if (!nextTag) {
      return;
    }

    setNodes((prev) =>
      updateNodeById(prev, expandedNodeId, (node) => ({
        ...node,
        tags: node.tags.map((tag, index) =>
          index === editingTag.index ? nextTag : tag,
        ),
      })),
    );
    setEditingTag(null);
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[var(--canvas)] text-[var(--ink)]">
      <div className="grid-overlay" />
      <div className="floating-orb floating-orb--one" />
      <div className="floating-orb floating-orb--two" />

      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8 md:px-10 md:pt-10 lg:px-14">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)]">
              KHA-8 NODE CONTROL
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Dashboard
            </h1>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Back to login
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)]/80 p-5 backdrop-blur md:p-6">
            <h2 className="mb-4 text-xl font-semibold">Registered nodes</h2>
            <ul className="space-y-3">
              {nodes.map((node) => {
                const isExpanded = expandedNodeId === node.id;
                return (
                  <li
                    key={node.id}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--canvas)] p-4"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedNodeId((prev) =>
                          prev === node.id ? null : node.id,
                        )
                      }
                      className="flex w-full items-center justify-between gap-3 text-left"
                      aria-expanded={isExpanded}
                    >
                      <span className="font-semibold">{node.name}</span>
                      <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        {node.status}
                      </span>
                    </button>
                    {isExpanded ? (
                      <div className="mt-3 grid gap-2 text-sm text-[var(--muted)]">
                        <p>
                          <span className="font-medium text-[var(--ink)]">Address:</span>{" "}
                          {node.address}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--ink)]">Region:</span>{" "}
                          {node.region}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--ink)]">
                            Registered:
                          </span>{" "}
                          {node.registeredAt}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--ink)]">Tags:</span>{" "}
                          {node.tags.length ? node.tags.join(", ") : "No tags"}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </article>

          <div className="space-y-6">
            <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)]/80 p-5 backdrop-blur md:p-6">
              <h2 className="mb-4 text-xl font-semibold">Register a new node</h2>
              <form
                aria-label="Register node form"
                onSubmit={handleRegisterNode}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <label htmlFor="register-name" className="text-sm font-medium">
                    Node name
                  </label>
                  <input
                    id="register-name"
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)]"
                    placeholder="Ex: Delta Relay"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-address" className="text-sm font-medium">
                    Endpoint
                  </label>
                  <input
                    id="register-address"
                    value={registerAddress}
                    onChange={(event) => setRegisterAddress(event.target.value)}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)]"
                    placeholder="10.10.20.14:51820"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="register-region" className="text-sm font-medium">
                    Region
                  </label>
                  <input
                    id="register-region"
                    value={registerRegion}
                    onChange={(event) => setRegisterRegion(event.target.value)}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)]"
                    placeholder="Ex: Sydney"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-ink)] transition hover:brightness-110"
                >
                  Register node
                </button>
              </form>
            </article>

            <article className="rounded-3xl border border-[var(--line)] bg-[var(--surface)]/80 p-5 backdrop-blur md:p-6">
              <h2 className="mb-4 text-xl font-semibold">Node details</h2>
              {!expandedNode ? (
                <p className="text-sm text-[var(--muted)]">
                  Select a node from the list to manage its name and tags.
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--canvas)] p-4 text-sm">
                    <p>
                      <span className="font-medium">Node ID:</span> {expandedNode.id}
                    </p>
                    <p>
                      <span className="font-medium">Current endpoint:</span>{" "}
                      {expandedNode.address}
                    </p>
                    <p>
                      <span className="font-medium">Region:</span> {expandedNode.region}
                    </p>
                  </div>

                  <form
                    aria-label="Rename node form"
                    onSubmit={handleRenameNode}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="rename-node-input"
                      className="text-sm font-medium"
                    >
                      Edit node name
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="rename-node-input"
                        value={nameDraft}
                        onChange={(event) =>
                          setNameDrafts((prev) => ({
                            ...prev,
                            [expandedNode.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)]"
                        required
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      >
                        Save name
                      </button>
                    </div>
                  </form>

                  <form
                    aria-label="Add tag form"
                    onSubmit={handleAddTag}
                    className="space-y-2"
                  >
                    <label htmlFor="add-tag-input" className="text-sm font-medium">
                      New tag
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="add-tag-input"
                        value={newTagDraft}
                        onChange={(event) =>
                          setNewTagDrafts((prev) => ({
                            ...prev,
                            [expandedNode.id]: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)]"
                        placeholder="Ex: canary"
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-[var(--line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      >
                        Add tag
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tags</p>
                    {expandedNode.tags.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">No tags yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {expandedNode.tags.map((tag, index) => (
                          <li
                            key={`${expandedNode.id}-${index}-${tag}`}
                            className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3"
                          >
                            {editingTag?.nodeId === expandedNode.id &&
                            editingTag.index === index ? (
                              <form
                                aria-label="Edit tag form"
                                onSubmit={handleSaveTag}
                                className="flex gap-2"
                              >
                                <label htmlFor="edit-tag-input" className="sr-only">
                                  Edit tag value
                                </label>
                                <input
                                  id="edit-tag-input"
                                  value={editingTag.value}
                                  onChange={(event) =>
                                    setEditingTag((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            value: event.target.value,
                                          }
                                        : prev,
                                    )
                                  }
                                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)]"
                                  required
                                />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                                >
                                  Save tag
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTag(null);
                                  }}
                                  className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm">{tag}</span>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTag({
                                        index,
                                        nodeId: expandedNode.id,
                                        value: tag,
                                      });
                                    }}
                                    className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                                  >
                                    Edit tag {tag}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTag(index)}
                                    className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                                  >
                                    Delete tag {tag}
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
