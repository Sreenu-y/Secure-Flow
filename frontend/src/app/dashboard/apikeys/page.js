"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Copy,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isTestKey, setIsTestKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingProcess, setCreatingProcess] = useState(false);

  // State to hold the newly created raw key to show exactly once
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);

  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchKeys();
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const res = await fetch("/api/keys/usage");
      if (res.ok) {
        const data = await res.json();
        setUsageData(data);
      }
    } catch (err) {
      console.error("Failed to fetch usage data", err);
    }
  };

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/keys");
      if (res.ok) {
        const data = await res.json();
        // The API returns an array, map `_id` to `id` if needed
        const mapped = data.map((k) => ({ ...k, id: k._id }));
        setApiKeys(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      setCreatingProcess(true);
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName, isTest: isTestKey }),
      });

      if (res.ok) {
        const data = await res.json();

        // Add minimal data to the list so UI updates
        setApiKeys((prev) => [
          {
            id: data.id,
            name: data.name,
            prefix: data.prefix,
            createdAt: data.createdAt,
          },
          ...prev,
        ]);

        // Save the raw key to show user ONCE
        setNewlyCreatedKey(data.key);

        setNewKeyName("");
        setIsCreating(false);
        setIsTestKey(false);
      } else {
        console.error("Failed to create key");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingProcess(false);
    }
  };

  const handleRevokeKey = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to revoke this API key? This cannot be undone.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
      } else {
        console.error("Failed to revoke key");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id, keyText) => {
    navigator.clipboard.writeText(keyText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const closeNewKeyModal = () => {
    setNewlyCreatedKey(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-gray-500/10 rounded-full blur-3xl -z-10"></div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text gradient-title flex items-center gap-3">
            <KeyRound className="h-8 w-8 text-gray-100" />
            API Keys
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Manage your secure tokens for API authentication and integrations.
          </p>
        </div>
        {!isCreating && !newlyCreatedKey && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-white hover:bg-gray-200 text-black font-semibold rounded-xl px-6 py-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 group"
          >
            <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            Create Secret Key
          </Button>
        )}
      </div>

      {newlyCreatedKey && (
        <Card className="border-green-500/30 shadow-2xl bg-black/60 backdrop-blur-xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <CardHeader className="border-b border-green-500/20 pb-6 bg-green-500/5">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
              API Key Created Successfully
            </CardTitle>
            <CardDescription className="text-gray-300 text-base mt-2">
              Please copy this key and save it somewhere safe. For security
              reasons,
              <strong className="text-white">
                {" "}
                you will not be able to see it again
              </strong>{" "}
              after you close this panel.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="bg-black/50 border border-white/10 p-4 rounded-xl flex items-center justify-between">
              <code className="text-green-400 font-mono text-lg tracking-wider break-all mr-4">
                {newlyCreatedKey}
              </code>
              <Button
                variant="outline"
                className="shrink-0 bg-white hover:bg-gray-200 text-white border-none"
                onClick={() => handleCopy("new", newlyCreatedKey)}
              >
                {copiedId === "new" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" /> Copy Key
                  </>
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pt-4 pb-6 px-6">
            <Button
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
              onClick={closeNewKeyModal}
            >
              I have saved this key safely
            </Button>
          </CardFooter>
        </Card>
      )}

      {isCreating && !newlyCreatedKey && (
        <Card className="border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gray-500/10 rounded-full blur-3xl -z-10"></div>
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Plus className="h-6 w-6 text-gray-300" />
              Issue New Secret Key
            </CardTitle>
            <CardDescription className="text-gray-400 text-base">
              Name your key descriptively to easily trace its usage in your
              logs.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 bg-black/20">
            <form onSubmit={handleCreateKey} className="flex flex-col gap-6">
              <div className="flex-1 w-full relative">
                <Label
                  htmlFor="keyName"
                  className="text-white/80 font-semibold mb-2 block"
                >
                  Key Name
                </Label>
                <div className="relative group">
                  <Input
                    id="keyName"
                    placeholder="e.g. Production Environment"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-white/5 border-white/10 hover:border-gray-500/50 focus:border-gray-400 text-white placeholder-gray-600 rounded-xl px-4 py-6 text-lg transition-all"
                    autoFocus
                  />
                  <div className="absolute inset-0 bg-gray-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity -z-10 rounded-xl"></div>
                </div>
              </div>

              <div className="flex items-center space-x-2 my-2">
                <input
                  type="checkbox"
                  id="isTestEnv"
                  checked={isTestKey}
                  onChange={(e) => setIsTestKey(e.target.checked)}
                  className="w-4 h-4 rounded appearance-none border border-white/20 bg-black/50 checked:bg-white checked:border-white focus:ring-1 focus:ring-white/50 relative checked:after:content-['✓'] checked:after:absolute checked:after:text-black checked:after:text-xs checked:after:font-bold checked:after:left-[2px] checked:after:-top-px transition-all cursor-pointer"
                />
                <Label
                  htmlFor="isTestEnv"
                  className="text-gray-300 cursor-pointer"
                >
                  This is a test key (will be prefixed with sk_test_)
                </Label>
              </div>

              <div className="flex gap-3 w-full sm:w-auto h-14 justify-end mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 sm:flex-none hover:bg-white/10 text-gray-300 rounded-xl h-full px-6"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newKeyName.trim() || creatingProcess}
                  className="flex-1 sm:flex-none bg-white hover:bg-gray-200 text-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-xl h-full px-8 text-md font-bold transition-all"
                >
                  {creatingProcess ? "Generating..." : "Issue Key"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gray-600/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <CardHeader className="border-b border-white/5 bg-black/20 pb-6 relative">
          <div className="absolute top-6 right-6">
            <ShieldAlert className="h-8 w-8 text-gray-500/30" />
          </div>
          <CardTitle className="text-2xl text-white">Active API Keys</CardTitle>
          <CardDescription className="text-gray-400 flex items-center gap-2 mt-2">
            <AlertCircle className="h-4 w-4" />
            Keep your secret keys secure. Never expose them in client-side code.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/40">
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-medium py-5 pl-8">
                    Name
                  </TableHead>
                  <TableHead className="text-gray-400 font-medium py-5">
                    Secret Token
                  </TableHead>
                  <TableHead className="text-gray-400 font-medium py-5 hidden sm:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-gray-400 font-medium py-5 text-right pr-8">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && apiKeys.length === 0 ? (
                  <TableRow className="border-none hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="text-center py-20 text-gray-400"
                    >
                      Loading API keys...
                    </TableCell>
                  </TableRow>
                ) : apiKeys.length === 0 ? (
                  <TableRow className="border-none hover:bg-transparent">
                    <TableCell colSpan={4} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center space-y-4 opacity-60">
                        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                          <KeyRound className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg text-gray-400">
                          No API keys generated yet.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((apiKey) => (
                    <TableRow
                      key={apiKey.id}
                      className="border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <TableCell className="font-semibold text-white whitespace-nowrap pl-8 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              "w-2 h-2 rounded-full " +
                              (apiKey.prefix === "sk_test_"
                                ? "bg-gray-400 shadow-[0_0_10px_rgba(156,163,175,0.5)]"
                                : "bg-gray-200 shadow-[0_0_10px_rgba(229,231,235,0.5)]")
                            }
                          ></div>
                          {apiKey.name}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm whitespace-nowrap py-5">
                        <code className="bg-black/50 border border-white/10 px-3 py-1.5 rounded-lg text-gray-300 inline-block tracking-widest relative overflow-hidden group/code">
                          {apiKey.prefix}••••••••••••••••••••••
                        </code>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm hidden sm:table-cell whitespace-nowrap py-5">
                        <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          {new Date(apiKey.createdAt).toLocaleDateString(
                            undefined,
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap pr-8 py-5">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors h-10 w-10"
                            onClick={() => handleRevokeKey(apiKey.id)}
                            title="Revoke key"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Usage Chart Section Moved Below Active Keys */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative overflow-hidden mt-6">
        <CardHeader className="border-b border-white/5 bg-black/20 pb-6 relative">
          <CardTitle className="text-2xl text-white">API Usage</CardTitle>
          <CardDescription className="text-gray-400 mt-2">
            Track your API key consumption over the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 relative">
          <div className="h-[300px] w-full">
            {usageData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={usageData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#e5e7eb" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#d1d5db"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsage)"
                    activeDot={{
                      r: 6,
                      fill: "#fff",
                      stroke: "#000",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-500 animate-pulse">
                Parsing real-time usage data...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
