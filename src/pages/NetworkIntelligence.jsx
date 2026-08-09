import { useMemo, useRef, useState, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Share2, MousePointerClick, Move, ZoomIn } from "lucide-react";
import { getNetworkGraph } from "../lib/api";

const TYPE_COLORS = {
  person: "#39ff88",
  vehicle: "#4dd0ff",
  location: "#ffb84d",
  shipment: "#c084fc",
  organization: "#ff6b6b",
};

const TYPE_LABELS = {
  person: "Person",
  vehicle: "Vehicle",
  location: "Location",
  shipment: "Shipment",
  organization: "Organization",
};

export default function NetworkIntelligence() {
  const fgRef = useRef();
  const [selected, setSelected] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [liveNodes, setLiveNodes] = useState([]);
  const [liveLinks, setLiveLinks] = useState([]);

  const fetchGraph = () => {
    getNetworkGraph().then((data) => {
      if (data && data.nodes && data.links) {
        setLiveNodes(data.nodes);
        setLiveLinks(data.links);
      }
    });
  };

  useEffect(() => {
    fetchGraph();
    window.addEventListener("narcoscope_data_updated", fetchGraph);
    return () => {
      window.removeEventListener("narcoscope_data_updated", fetchGraph);
    };
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: liveNodes.map((e) => ({
        id: e.id,
        label: e.label || e.name || e.id,
        type: e.type || e.entity_type || "person",
        sectorId: e.sectorId || "S01",
        connections: e.connections || 1,
        riskIndicator: e.riskIndicator ?? e.risk_score ?? 50,
      })),
      links: liveLinks.map((r) => ({
        source: typeof r.source === "object" ? r.source.id : r.source,
        target: typeof r.target === "object" ? r.target.id : r.target,
        type: r.type || "associated",
        label: r.label || r.type || "associated",
      })),
    }),
    [liveNodes, liveLinks]
  );

  // Densest sector, for the context stat
  const densestSector = useMemo(() => {
    const counts = {};
    for (const e of liveNodes) {
      if (!e.sectorId) continue;
      counts[e.sectorId] = (counts[e.sectorId] ?? 0) + 1;
    }
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return topId ? { id: topId } : null;
  }, [liveNodes]);

  const handleNodeClick = (node) => {
    setSelected(node ? liveNodes.find((n) => n.id === node.id) ?? node : null);
    if (node && fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 600);
      fgRef.current.zoom(3, 600);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-140px)]">
      {/* Context header */}
      <div className="glass-panel px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2 text-[12px] text-text-dim">
          <Share2 size={13} className="text-accent-neon" />
          <span>
            <strong className="text-text font-mono">{liveNodes.length}</strong> entities linked by{" "}
            <strong className="text-text font-mono">{liveLinks.length}</strong> relationships
            across <strong className="text-text font-mono">{new Set(liveNodes.map((n) => n.sectorId)).size}</strong> sectors —
            node position reflects connection strength, not geography.
          </span>
        </div>
        <div className="ml-auto flex items-center gap-4 text-[11px] text-text-faint">
          <span className="flex items-center gap-1.5">
            <MousePointerClick size={12} /> Click a node for details
          </span>
          <span className="flex items-center gap-1.5">
            <Move size={12} /> Drag to pan
          </span>
          <span className="flex items-center gap-1.5">
            <ZoomIn size={12} /> Scroll to zoom
          </span>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Graph canvas */}
        <div className="glass-panel flex-1 overflow-hidden relative">
          <div className="p-4 pb-0 flex items-center justify-between">
            <div>
              <div className="eyebrow">Relationship Graph</div>
              {densestSector && (
                <p className="text-[10.5px] text-text-faint mt-0.5">
                  Densest cluster: {densestSector.id}
                </p>
              )}
            </div>
            {hoveredNode && (
              <div className="text-[11px] text-text-dim text-right">
                <div className="font-medium text-text">{hoveredNode.label}</div>
                <div className="text-text-faint capitalize">
                  {TYPE_LABELS[hoveredNode.type]} · Sector {hoveredNode.sectorId} ·{" "}
                  {hoveredNode.connections} link{hoveredNode.connections === 1 ? "" : "s"}
                </div>
              </div>
            )}
          </div>

          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            backgroundColor="rgba(0,0,0,0)"
            nodeLabel={(n) =>
              `${n.label} · ${TYPE_LABELS[n.type]} · Sector ${n.sectorId} · ${n.connections} link${
                n.connections === 1 ? "" : "s"
              }`
            }
            linkLabel={(l) => l.label}
            nodeColor={(n) => TYPE_COLORS[n.type] ?? "#8b93a7"}
            nodeRelSize={4}
            nodeVal={(n) => 1 + n.connections * 0.4}
            linkColor={() => "rgba(255,255,255,0.15)"}
            linkWidth={1}
            linkDirectionalParticles={0}
            onNodeClick={handleNodeClick}
            onNodeHover={setHoveredNode}
            onBackgroundClick={() => setSelected(null)}
            width={undefined}
            height={undefined}
            cooldownTicks={100}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 bg-bg/70 backdrop-blur px-3 py-2 rounded-lg border border-border">
            <div className="text-[9.5px] font-mono text-text-faint uppercase mb-0.5">Entity Type</div>
            {Object.entries(TYPE_COLORS).map(([type, color]) => {
              const count = liveNodes.filter((e) => e.type === type).length;
              return (
                <div key={type} className="flex items-center gap-2 text-[11px] text-text-dim">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span>{TYPE_LABELS[type]}</span>
                  <span className="ml-auto text-text-faint font-mono">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Node size legend */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-bg/70 backdrop-blur px-3 py-2 rounded-lg border border-border text-[10.5px] text-text-faint">
            <span className="w-1.5 h-1.5 rounded-full bg-text-faint" />
            Node size = number of connections
          </div>
        </div>

        {/* Selected entity detail panel */}
        <div className="glass-panel w-72 shrink-0 p-4 overflow-y-auto">
          <div className="eyebrow mb-3">Entity Details</div>
          {selected ? (
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-[15px] font-semibold">{selected.label}</div>
                <div className="text-[11px] text-text-faint capitalize">{TYPE_LABELS[selected.type]}</div>
              </div>
              <div className="flex flex-col gap-1.5 text-[12px]">
                <Row label="ID" value={selected.id} />
                <Row label="Sector" value={selected.sectorId} />
                <Row label="Risk Indicator" value={`${selected.riskIndicator}%`} />
                <Row label="Connections" value={selected.connections} />
                <Row label="Locations" value={selected.locations} />
                <Row label="Events" value={selected.events} />
                <Row label="First Seen" value={selected.createdAt} />
              </div>
            </div>
          ) : (
            <p className="text-text-dim text-[12px]">
              Click a node in the graph to view entity details. Hover any node to preview it, or hover a
              connecting line to see the relationship type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-faint">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}